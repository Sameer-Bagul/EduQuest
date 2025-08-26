const path = require('path');

module.exports = {
  packagerConfig: {
    name: 'EduQuest',
    executableName: 'eduquest',
    icon: path.join(__dirname, 'assets', 'icon'),
    appBundleId: 'com.eduquest.assignment-platform',
    appCategoryType: 'public.app-category.education',
    win32metadata: {
      CompanyName: 'EduQuest Platform',
      FileDescription: 'Digital Assignment Platform with Advanced Proctoring',
      ProductName: 'EduQuest',
      InternalName: 'EduQuest'
    },
    osxSign: {
      identity: 'Developer ID Application: EduQuest Platform'
    },
    protocols: [
      {
        name: 'EduQuest',
        schemes: ['eduquest']
      }
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'EduQuest',
        authors: 'EduQuest Platform',
        description: 'Digital Assignment Platform with Advanced Proctoring',
        setupIcon: path.join(__dirname, 'assets', 'icon.ico'),
        loadingGif: path.join(__dirname, 'assets', 'loading.gif'),
        setupExe: 'EduQuest-Setup.exe',
        noMsi: true
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'EduQuest Platform',
          homepage: 'https://eduquest.example.com',
          description: 'Digital Assignment Platform with Advanced Proctoring',
          productDescription: 'A comprehensive platform for creating, managing, and evaluating digital assignments with advanced anti-cheating features.',
          categories: ['Education', 'Office'],
          priority: 'optional',
          section: 'education',
          depends: ['gconf2', 'gconf-service', 'libnotify4', 'libappindicator1', 'libxtst6', 'libnss3']
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          license: 'MIT',
          homepage: 'https://eduquest.example.com',
          description: 'Digital Assignment Platform with Advanced Proctoring',
          productDescription: 'A comprehensive platform for creating, managing, and evaluating digital assignments with advanced anti-cheating features.',
          categories: ['Education', 'Office'],
          requires: ['gconf2', 'libnotify', 'libappindicator', 'libXtst', 'nss']
        }
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    }
  ]
};