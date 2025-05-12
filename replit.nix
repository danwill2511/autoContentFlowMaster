{pkgs}: {
  deps = [
    pkgs.nodePackages_latest.eas-cli
    pkgs.nodePackages.expo-cli
    pkgs.nodePackages_latest.expo-cli
  ];
}
