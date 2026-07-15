#!/usr/bin/env bash
set -euo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
hypr_dir="${XDG_CONFIG_HOME:-$HOME/.config}/hypr"
hypr_conf="$hypr_dir/hyprland.conf"
app_config_dir="${XDG_CONFIG_HOME:-$HOME/.config}/sharply-search"
font_dir="${XDG_DATA_HOME:-$HOME/.local/share}/fonts/sharply-search"
include='source = ~/.config/hypr/sharply-search.conf'

mkdir -p "$HOME/.local/bin" "$HOME/.config/wofi" "$hypr_dir" "$app_config_dir" "$font_dir"
ln -sfn "$root/sharply-search" "$HOME/.local/bin/sharply-search"
ln -sfn "$root/wofi-style.css" "$HOME/.config/wofi/sharply-search.css"
ln -sfn "$root/wofi-details.css" "$HOME/.config/wofi/sharply-search-details.css"
ln -sfn "$root/hyprland-sharply-search.conf" "$hypr_dir/sharply-search.conf"
install -m 644 "$root/assets/fonts/SpaceGrotesk-VariableFont_wght.ttf" "$font_dir/SpaceGrotesk-VariableFont_wght.ttf"
install -m 644 "$root/assets/fonts/OFL.txt" "$font_dir/OFL.txt"
if command -v fc-cache >/dev/null; then
  fc-cache -f "$font_dir" >/dev/null
fi
if [[ ! -f "$app_config_dir/.env" ]]; then
  install -m 600 "$root/sharply-search.env.example" "$app_config_dir/.env"
  printf 'Add your Sharply API key to %s before running the launcher.\n' "$app_config_dir/.env"
fi

"$root/sharply-search" --rebuild-cache

if [[ -f $hypr_conf ]] && ! grep -Fqx "$include" "$hypr_conf"; then
  printf '\n# Sharply gear launcher\n%s\n' "$include" >> "$hypr_conf"
fi

if command -v hyprctl >/dev/null && hyprctl monitors >/dev/null 2>&1; then
  hyprctl reload
fi

printf 'Installed ~/.local/bin/sharply-search\n'
printf 'Linked Hyprland Super+G to sharply-search and reloaded the running session.\n'
