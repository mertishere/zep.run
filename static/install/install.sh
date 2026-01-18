#!/bin/bash

OLD_LOCAL_ZEP="$HOME/.local"
LOCAL_ZEP="$HOME/.zep"

if [ -e "$OLD_LOCAL_ZEP" ]; then
    mv $OLD_LOCAL_ZEP $LOCAL_ZEP
fi

if ! [ -e "$LOCAL_ZEP" ]; then
    mkdir -p "${LOCAL_ZEP}"
fi

TARGET="1.0.2"
if [ $# -gt 0 ]; then
    TARGET="$1"
fi

ZEP_DIR="$LOCAL_ZEP"
ZEP_ZIG_DIR="$ZEP_DIR/zig"
ZEP_VERSION_DIR="$ZEP_DIR/zep/d/$TARGET/x86_64-linux"
MANIFEST_ZEP="$ZEP_DIR/zep/manifest.json"
ZEP_EXE="$ZEP_DIR/bin/zep"
ZIG_EXE="$ZEP_DIR/bin/zig"

TEMP_DIR="/tmp"
TEMP_ZEP_TAR_FILE="$TEMP_DIR/$TARGET.tar.xz"

sudo rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

###
# Clear everything FIRST
###
clean_up() {
    sudo rm -rf "$ZEP_VERSION_DIR"
}
clean_up

###
# Create directories
###
mkdir -p "$ZEP_VERSION_DIR"
mkdir -p "$ZEP_ZIG_DIR"

JSON_STRING="{
    \"name\":\"zep_x86_64-linux_${TARGET}\",
    \"path\":\"${ZEP_VERSION_DIR}\"
}"

mkdir -p "$(dirname "$MANIFEST_ZEP")"
echo "$JSON_STRING" > "$MANIFEST_ZEP"

###
# Download and extract
###

curl -L "https://zep.run/releases/$TARGET/zep_x86_64-linux_$TARGET.tar.xz" \
    -o "$TEMP_ZEP_TAR_FILE"

tar -xvf "$TEMP_ZEP_TAR_FILE" -C "$ZEP_VERSION_DIR"
ZEP_VERSION_EXE=$ZEP_VERSION_DIR/zep
if [ -e "$ZEP_VERSION_DIR/zep" ]; then
    ZEP_VERSION_EXE=$ZEP_VERSION_DIR/zep
fi
sudo rm -rf "$TEMP_DIR"

chmod 755 "$ZEP_VERSION_EXE"
sudo rm -rf "$ZEP_EXE"

sudo ln -s "$ZEP_VERSION_EXE" "$ZEP_EXE"
sudo chmod 755 "$ZEP_VERSION_EXE"

echo "Installation finished for zeP version $Target."
echo "The location of the executeable is: $ExeZepFile"
echo "You may need to restart your Terminal. After that run '$ zep help', for checking."
