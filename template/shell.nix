with import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/22.11.tar.gz") { };

stdenv.mkDerivation {
  name = "--projectname--";

  buildInputs = with pkgs; [
    nodejs-18_x
  ]; 
}
