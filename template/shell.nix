with import (fetchTarball https://github.com/NixOS/nixpkgs/archive/22.11.tar.gz) { };

stdenv.mkDerivation {
  name = "--projectname--";

  buildInputs = with pkgs; [
    caddy
    haskellPackages.dotenv
    nodejs-16_x
    tmux
    yarn
  ];

  shellHook = ''
    run () {
      yarn install
      tmux new-session -s "--appname-- Development" \
        'yarn start' \; \
        split-window 'yarn caddy' \; \
        split-window -h 'zsh'
    }
  '';
}
