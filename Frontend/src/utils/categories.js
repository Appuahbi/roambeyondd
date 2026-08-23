export const CAT_KEY = {
  'Domestic Tours': 'domestic',
  'Trekking Expeditions': 'trekking',
  'Group Tours': 'group',
  'Honeymoon Packages': 'honeymoon',
  'Corporate Tours': 'corporate',
};

export const translateCategoryName = (t, name) => {
  const key = CAT_KEY[name];
  return key ? t(`categories.${key}.name`) : name;
};
