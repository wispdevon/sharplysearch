#!/usr/bin/env bash
set -euo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
hypr_dir="${XDG_CONFIG_HOME:-$HOME/.config}/hypr"
hypr_conf="$hypr_dir/hyprland.conf"
app_config_dir="${XDG_CONFIG_HOME:-$HOME/.config}/sharply-search"
include='source = ~/.config/hypr/sharply-search.conf'

mkdir -p "$HOME/.local/bin" "$HOME/.config/wofi" "$hypr_dir" "$app_config_dir"
ln -sfn "$root/sharply-search" "$HOME/.local/bin/sharply-search"
ln -sfn "$root/wofi-style.css" "$HOME/.config/wofi/sharply-search.css"
ln -sfn "$root/wofi-details.css" "$HOME/.config/wofi/sharply-search-details.css"
ln -sfn "$root/hyprland-sharply-search.conf" "$hypr_dir/sharply-search.conf"
if [[ ! -f "$app_config_dir/.env" ]]; then
  install -m 600 "$root/sharply-search.env.example" "$app_config_dir/.env"
  printf 'Add your Sharply API key to %s before running the launcher.\n' "$app_config_dir/.env"
fi

if [[ -f $hypr_conf ]] && ! grep -Fqx "$include" "$hypr_conf"; then
  printf '\n# Sharply gear launcher\n%s\n' "$include" >> "$hypr_conf"
fi

if command -v hyprctl >/dev/null && hyprctl monitors >/dev/null 2>&1; then
  hyprctl reload
fi

printf 'Installed ~/.local/bin/sharply-search\n'
printf 'Linked Hyprland Super+G to sharply-search and reloaded the running session.\n'
