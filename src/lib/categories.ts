// src/lib/categories.ts

export const CATEGORIES = {
  makeup: {
    label: 'آرایشی',
    subcategories: {
      mascara: 'ریمل',
      eyeliner: 'خط چشم',
      concealer: 'کانسیلر',
      'bb-cream': 'BB کرم',
      'cc-cream': 'CC کرم',
      'dd-cream': 'DD کرم',
    },
  },
  sunscreen: {
    label: 'ضدآفتاب',
    subcategories: {
      colorless: 'بدون رنگ',
      tinted: 'رنگی',
    },
  },
  fragrance: {
    label: 'عطر و خوشبوکننده',
    subcategories: {
      perfume: 'عطر',
      'body-mist': 'بادی میست',
      'roll-on': 'مام رول',
    },
  },
  'specialized-cream': {
    label: 'کرم تخصصی',
    subcategories: {
      face: 'کرم صورت',
      body: 'کرم بدن',
      eye: 'کرم دور چشم',
    },
  },
  'specialized-serum': {
    label: 'سرم تخصصی',
    subcategories: {
      body: 'سرم بدن',
      eye: 'سرم دور چشم',
      face: 'سرم صورت',
      hair: 'سرم مو',
    },
  },
  'specialized-mask': {
    label: 'ماسک تخصصی',
    subcategories: {
      face: 'ماسک صورت',
      hair: 'ماسک مو',
    },
  },
  'oil-lotion': {
    label: 'روغن و لوسیون',
    subcategories: {
      'body-oil': 'روغن بدن',
      'hair-oil': 'روغن مو',
      lotion: 'لوسیون',
    },
  },
  cleanser: {
    label: 'شوینده و پاک‌کننده',
    subcategories: {
      pan: 'پن',
      toner: 'تونر',
      'wash-gel': 'ژل شستشو',
      soap: 'صابون بهداشتی',
      foam: 'فوم شستشو',
      'hand-wash': 'مایع دستشویی',
      biphasic: 'محلول دوفازی',
      micellar: 'میسلار واتر',
    },
  },
  'oral-care': {
    label: 'دهان و دندان',
    subcategories: {
      toothpaste: 'خمیر دندان',
      freshener: 'خوشبوکننده دهان',
      mouthwash: 'دهان‌شویه',
    },
  },
  shampoo: {
    label: 'شامپو تخصصی',
    subcategories: {
      body: 'شامپو بدن',
      hair: 'شامپو سر',
    },
  },
  kit: {
    label: 'کیت تخصصی',
    subcategories: {
      body: 'کیت بدن',
      face: 'کیت صورت',
      hair: 'کیت مو',
    },
  },
  tools: {
    label: 'ابزارها و سمپل‌ها',
    subcategories: {
      tools: 'ابزارها',
      samples: 'سمپل فروش',
    },
  },
} as const;

export type CategorySlug = keyof typeof CATEGORIES;
export type SubcategorySlug<C extends CategorySlug> = keyof typeof CATEGORIES[C]['subcategories'];

export type AllSubcategorySlugs = {
  [C in CategorySlug]: SubcategorySlug<C>;
}[CategorySlug];

export function isCategorySlug(slug: string): slug is CategorySlug {
  return slug in CATEGORIES;
}

export function resolveCategoryPath(slug: string[]): {
  category: CategorySlug;
  subcategory?: string;
  categoryLabel: string;
  subcategoryLabel?: string;
} | null {
  if (slug.length === 0 || slug.length > 2) {
    return null;
  }

  const [categorySlug, subcategorySlug] = slug;

  if (!isCategorySlug(categorySlug)) {
    return null;
  }

  const category = CATEGORIES[categorySlug];

  if (!subcategorySlug) {
    return {
      category: categorySlug,
      categoryLabel: category.label,
    };
  }

  const subcategories = category.subcategories;
  if (!(subcategorySlug in subcategories)) {
    return null;
  }

  return {
    category: categorySlug,
    subcategory: subcategorySlug,
    categoryLabel: category.label,
    subcategoryLabel:
      subcategories[subcategorySlug as keyof typeof subcategories],
  };
}

// اصلاح بنیادین: تغییر مسیرها از حالت مفرد به جمع برای هماهنگی با پوشه app/categories
export function getCategoryHref(category: CategorySlug): string {
  return `/categories/${category}`;
}

export function getSubcategoryHref(
  category: CategorySlug,
  subcategory: string,
): string {
  return `/categories/${category}/${subcategory}`;
}