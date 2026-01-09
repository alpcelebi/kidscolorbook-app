module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/domain': './src/domain',
            '@/data': './src/data',
            '@/features': './src/features',
            '@/ui': './src/ui',
            '@/i18n': './src/i18n',
            '@/navigation': './src/navigation',
            '@/utils': './src/utils',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};

