with import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/24.05.tar.gz") { };

stdenv.mkDerivation {
  name = "--projectname--";

  buildInputs = with pkgs; [
    nodejs_20
  ];
}
