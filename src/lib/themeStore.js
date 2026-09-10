import localforage from 'localforage';

export const themeStore = localforage.createInstance({
  name: 'ssr_theme'
});

export const getThemeConfig = async () => {
  const config = await themeStore.getItem('theme_config');
  return config || { mode: 'light' };
};

export const saveThemeConfig = async (config) => {
  await themeStore.setItem('theme_config', config);
};
