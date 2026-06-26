export type Product = {
    id: string
    name: string
    subtitle: string
    price: string
    category: 'skin' | 'hair'
    image: string
    tag?: string
  }
  
  export const products: Product[] = [
    {
      id: 'serum-gold',
      name: 'سرم طلایی احیاکننده',
      subtitle: 'آبرسانی عمیق و درخشندگی',
      price: '۲٬۸۵۰٬۰۰۰',
      category: 'skin',
      image: '/products/hero-serum.png',
      tag: 'پرفروش',
    },
    {
      id: 'cream-night',
      name: 'کرم شب ترمیم‌کننده',
      subtitle: 'بازسازی سلولی در طول خواب',
      price: '۱٬۹۸۰٬۰۰۰',
      category: 'skin',
      image: '/products/cream.png',
    },
    {
      id: 'hair-oil',
      name: 'روغن مغذی موی آرگان',
      subtitle: 'تقویت و درخشش طبیعی مو',
      price: '۱٬۴۵۰٬۰۰۰',
      category: 'hair',
      image: '/products/oil.png',
      tag: 'جدید',
    },
    {
      id: 'cleanser',
      name: 'ژل شستشوی ملایم',
      subtitle: 'پاکسازی عمیق بدون خشکی',
      price: '۹۸۰٬۰۰۰',
      category: 'skin',
      image: '/products/cleanser.png',
    },
    {
      id: 'mist',
      name: 'میست آبرسان گل رز',
      subtitle: 'طراوت و تعادل پوست',
      price: '۱٬۲۵۰٬۰۰۰',
      category: 'skin',
      image: '/products/mist.png',
    },
    {
      id: 'hair-serum',
      name: 'سرم ضد ریزش مو',
      subtitle: 'تحریک رشد و تراکم مو',
      price: '۲٬۱۰۰٬۰۰۰',
      category: 'hair',
      image: '/products/oil.png',
      tag: 'ویژه',
    },
  ]
  