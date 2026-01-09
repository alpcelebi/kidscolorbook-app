const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * This plugin modifies the Android app's build.gradle to use a shorter
 * CMake build staging directory, helping to avoid the Windows 260 character
 * path limit during native builds.
 */
const withShortCmakePath = (config) => {
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            // Add shorter CMake build directory configuration
            const cmakeConfig = `
// Fix for Windows 260 character path limit
android.externalNativeBuild.cmake.buildStagingDirectory = file("C:/tmp/cmake-build")
`;

            // Insert after the first android { block
            const androidBlockRegex = /android\s*\{/;
            if (androidBlockRegex.test(config.modResults.contents)) {
                config.modResults.contents = config.modResults.contents.replace(
                    androidBlockRegex,
                    `android {\n${cmakeConfig}`
                );
            }
        }
        return config;
    });
};

module.exports = withShortCmakePath;
