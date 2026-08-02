import requests
from bs4 import BeautifulSoup
from PIL import Image
import io
import base64
import time
import re
from urllib.parse import unquote

NEXTJS_API_URL = "http://localhost:3000/api/admin/products/sync"
SYNC_SECRET_TOKEN = "my_super_secret_python_token_123!" 

def process_multiple_images(image_urls):
    processed_bases64 = []
    for img_url in image_urls:
        try:
            print(f"[*] Downloading Raw Image: {img_url}")
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(img_url, headers=headers, timeout=15)
            
            if response.status_code == 200 and 'image' in response.headers.get('Content-Type', ''):
                raw_img = Image.open(io.BytesIO(response.content))
                
                buffer = io.BytesIO()
                
                if raw_img.mode in ('RGBA', 'LA') or (raw_img.mode == 'P' and 'transparency' in raw_img.info):
                    raw_img = raw_img.convert("RGBA")
                else:
                    raw_img = raw_img.convert("RGB")
                    
                raw_img.save(buffer, format="WEBP", quality=100)
                processed_bases64.append(base64.b64encode(buffer.getvalue()).decode('utf-8'))
            else:
                print(f"[!] Invalid image response from {img_url}")
        except Exception as e:
            print(f"[!] Image Processing Error ({img_url}): {e}")
    return processed_bases64

def generate_default_faqs(title):
    return [
        {
            "question": f"آیا {title} دارای ضمانت اصالت کالا است؟",
            "answer": "بله، تمامی محصولات عرضه شده در فروشگاه ما دارای ضمانت اصالت و کیفیت می‌باشند."
        },
        {
            "question": "نحوه ارسال این محصول به چه صورت است؟",
            "answer": "ارسال از طریق پست پیشتاز و پیک اختصاصی به سراسر کشور انجام می‌شود."
        }
    ]

def scrape_and_sync_product(url, category_id):
    print(f"\n--- Processing: {url} ---")
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        slug = url.split('/')[-1]
        
        # ۱. استخراج عنوان
        title = "بدون عنوان"
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.text.split('|')[0].strip()
            
        # ۲. کد محصول
        product_code_text = ""
        code_tag = soup.find(string=re.compile("کد محصول"))
        if code_tag:
            product_code_text = code_tag.parent.text.strip()
            
        # ۳. ویژگی‌های کوتاه بالای صفحه
        short_features = []
        for ul in soup.find_all('ul'):
            lis = ul.find_all('li')
            if lis and len(lis) <= 10:
                for li in lis:
                    text = li.text.strip()
                    if text and not text.startswith("کد محصول"):
                        short_features.append(text)
                if short_features:
                    break
        
        short_desc_parts = []
        if product_code_text:
            short_desc_parts.append(f"• {product_code_text}")
        if short_features:
            short_desc_parts.append("\n".join([f"• {f}" for f in short_features]))
            
        description = "\n".join(short_desc_parts) if short_desc_parts else f"خرید اینترنتی {title}"
            
        # ۴. توضیحات کامل
        rich_description = ""
        desc_element = soup.find('div', id='product-description')
        if desc_element:
            for br in desc_element.find_all("br"):
                br.replace_with("\n")
            for block in desc_element.find_all(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
                block.insert_before("\n\n")
                block.insert_after("\n\n")
            for li in desc_element.find_all('li'):
                li.insert_before("\n")
                li.insert_after("\n")
            rich_description = desc_element.get_text()
            rich_description = re.sub(r'[ \t\r\f\v]+', ' ', rich_description)
            rich_description = re.sub(r'\n\s*\n+', '\n\n', rich_description)
            rich_description = rich_description.strip()
            rich_description = re.sub(r'^توضیحات\s*', '', rich_description).strip()
            
        # ۵. استخراج قیمت
        price = 0
        price_match = re.search(r'مصرف[\s\u200c]*کننده.*?(\d{1,3}(?:,\d{3})+)', soup.text)
        if price_match:
            price = int(price_match.group(1).replace(',', ''))
            print(f"[*] Found Price: {price}")
            
        # ۶. استخراج آدرس عکس‌ها (روش جستجوی عمیق برای دور زدن Lazy Loading)
        image_urls = []
        
        # پاکسازی سورس‌کد از اسلش‌های اضافی که در جاوااسکریپت سایت مخفی شده‌اند
        clean_html = response.text.replace('\\/', '/')
        
        # 🌟 جستجوی تمام لینک‌های گالری در کل کدهای صفحه (حتی عکس‌هایی که هنوز رندر نشده‌اند)
        gallery_matches = re.findall(r'https?://[^"\s<>{}|`]+/gallery_image/[^"\s<>{}|`]+\.(?:png|jpg|jpeg|webp)', clean_html)
        
        for img_link in gallery_matches:
            if img_link not in image_urls:
                image_urls.append(img_link)
                
        # اگر گالری نداشت، دنبال عکس اصلی (کاور) بگرد
        if not image_urls:
            home_page_matches = re.findall(r'https?://[^"\s<>{}|`]+/home_page/[^"\s<>{}|`]+\.(?:png|jpg|jpeg|webp)', clean_html)
            for img_link in home_page_matches:
                if img_link not in image_urls:
                    image_urls.append(img_link)
                    
        # روش قدیمی به عنوان پشتیبان (محض احتیاط)
        if not image_urls:
            for img in soup.find_all('img'):
                src = img.get('src', '')
                if '/_next/image?url=' in src and ('gallery_image' in src or 'home_page' in src):
                    raw_url = src.split('url=')[1].split('&')[0]
                    img_link = unquote(raw_url)
                    if img_link not in image_urls:
                        image_urls.append(img_link)
                        
        print(f"[*] Found {len(image_urls)} Image URLs (Deep Search).")
        images_base64 = process_multiple_images(image_urls)
        
        # 🌟 ۷. استخراج لینک مستقیم ویدیو از ابر آروان (ArvanCloud) - منطق فوق‌هوشمند
        fetch_video_urls = []
        arvan_matches = re.findall(r'https://[a-zA-Z0-9.-]+\.arvanvod\.ir/[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+', response.text)
        unique_arvan_bases = list(set(arvan_matches))
        
        for base_url in unique_arvan_bases:
            config_url = f"{base_url}/origin_config.json"
            print(f"[*] Found Video Config: {config_url}")
            try:
                vid_resp = requests.get(config_url, headers=headers, timeout=10)
                if vid_resp.status_code == 200:
                    mp4_links = []
                    
                    try:
                        data = vid_resp.json()
                        sources = data.get('player', {}).get('media', {}).get('src', [])
                        if isinstance(sources, list):
                            for src in sources:
                                src_url = src.get('src', '')
                                if src.get('type') == 'video/mp4' or str(src_url).endswith('.mp4'):
                                    mp4_links.append(src_url)
                    except:
                        pass
                        
                    if not mp4_links:
                        clean_text = vid_resp.text.replace('\\/', '/')
                        mp4_links = re.findall(r'https?://[^"\s<>{}|`]+\.mp4', clean_text)
                        
                        if not mp4_links:
                            relatives = re.findall(r'"([^"\s<>{}|`]+\.mp4)"', clean_text)
                            if relatives:
                                mp4_links = [f"{base_url}/{r}" for r in relatives]

                    if mp4_links:
                        direct_mp4 = mp4_links[-1]
                        
                        # 🌟 جادوی رمزگشایی لینک‌های داینامیک ابر آروان
                        # تبدیل لینک: h_,144_200,1080_4500,k.mp4 ---> h_1080_4500k.mp4
                        if "h_," in direct_mp4 and ",k.mp4" in direct_mp4:
                            base_url_part = direct_mp4.split("h_,")[0]
                            qualities = direct_mp4.split("h_,")[1].split(",k.mp4")[0].split(",")
                            # انتخاب بالاترین کیفیت (آخرین عدد در لیست)
                            best_quality = qualities[-1] 
                            direct_mp4 = f"{base_url_part}h_{best_quality}k.mp4"

                        print(f"[+] Found Clean Direct MP4 URL: {direct_mp4}")
                        if direct_mp4 not in fetch_video_urls:
                            fetch_video_urls.append(direct_mp4)
                    else:
                        print("[-] JSON downloaded but no MP4 found inside.")
            except Exception as e:
                print(f"[!] Error extracting video: {e}")
            config_url = f"{base_url}/origin_config.json"
            print(f"[*] Found Video Config: {config_url}")
            try:
                vid_resp = requests.get(config_url, headers=headers, timeout=10)
                if vid_resp.status_code == 200:
                    mp4_links = []
                    
                    # روش اول: استخراج مستقیم از ساختار رسمی JSON آروان‌کلاد
                    try:
                        data = vid_resp.json()
                        sources = data.get('player', {}).get('media', {}).get('src', [])
                        if isinstance(sources, list):
                            for src in sources:
                                src_url = src.get('src', '')
                                if src.get('type') == 'video/mp4' or str(src_url).endswith('.mp4'):
                                    mp4_links.append(src_url)
                    except:
                        pass
                        
                    # روش دوم (فال‌بک): اگر فایل جیسون استاندارد نبود، اسکن متنی قدرتمند
                    if not mp4_links:
                        # حذف اسلش‌های فراری (مثلا \/ به / تبدیل شود)
                        clean_text = vid_resp.text.replace('\\/', '/')
                        
                        # جستجوی لینک‌های کامل
                        mp4_links = re.findall(r'https?://[^"\s<>{}|`]+\.mp4', clean_text)
                        
                        # جستجوی لینک‌های نسبی (فقط نام فایل)
                        if not mp4_links:
                            relatives = re.findall(r'"([^"\s<>{}|`]+\.mp4)"', clean_text)
                            if relatives:
                                mp4_links = [f"{base_url}/{r}" for r in relatives]

                    if mp4_links:
                        # گرفتن بالاترین کیفیت (معمولاً آخرین لینک در آروان کیفیت 720 یا 1080 است)
                        direct_mp4 = mp4_links[-1]
                        print(f"[+] Found Direct MP4 URL: {direct_mp4}")
                        if direct_mp4 not in fetch_video_urls:
                            fetch_video_urls.append(direct_mp4)
                    else:
                        print("[-] JSON downloaded but no MP4 found inside.")
            except Exception as e:
                print(f"[!] Error extracting video: {e}")

        # ۸. جدول مشخصات فنی
        attributes = []
        details_container = soup.find('div', id='product-details')
        if details_container:
            all_p = [p.text.strip() for p in details_container.find_all('p') if p.text.strip() != "جزییات"]
            if len(all_p) % 2 != 0:
                all_p = all_p[1:]
            for i in range(0, len(all_p), 2):
                attributes.append({"key": all_p[i], "value": all_p[i+1].replace('\u200c', ' ')})

        print(f"[*] Found {len(attributes)} Attributes.")

        # ۹. استخراج سوالات متداول (FAQ)
        faqs = []
        accordion_buttons = soup.find_all('button', {'aria-controls': True})
        for btn in accordion_buttons:
            question = btn.text.strip()
            panel_id = btn.get('aria-controls')
            if panel_id:
                panel = soup.find('div', id=panel_id)
                if panel:
                    answer = panel.text.strip()
                    if question and answer and len(question) > 5:
                        faqs.append({"question": question, "answer": answer})
        
        if faqs:
            print(f"[*] Successfully extracted {len(faqs)} REAL FAQs from website.")
        else:
            faqs = generate_default_faqs(title)
            print("[*] No real FAQs found, using defaults.")
            
        # ۱۰. ساخت ساختار اطلاعات برای ارسال
        payload = {
            "title": title,
            "slug": slug,
            "description": description,
            "richDescription": rich_description,
            "price": price,
            "discountedPrice": None,
            "imagesBase64": images_base64,
            "fetchVideoUrls": fetch_video_urls, # 🌟 ارسال لینک‌های ویدیو به سرور شما
            "categoryId": category_id,
            "referenceUrl": url,
            "faqs": faqs,
            "attributes": attributes
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {SYNC_SECRET_TOKEN}"
        }
        
        print("[*] Sending data to Next.js API...")
        api_response = requests.post(NEXTJS_API_URL, json=payload, headers=headers)
        
        if api_response.status_code in [200, 201]:
            print(f"[+] Success: {api_response.json().get('message')}")
        else:
            print(f"[-] API Error: {api_response.text}")
            
    except Exception as e:
        print(f"[!] Scraping Error: {e}")

if __name__ == "__main__":
    TARGET_CATEGORY_ID = "cmr69jadj000altvk3ezlbo07" 
    
    product_urls = [
        "https://liateam.ir/products/337", 
    ]
    
    for url in product_urls:
        scrape_and_sync_product(url, TARGET_CATEGORY_ID)
        time.sleep(2)