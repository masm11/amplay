#!/bin/sh

for sz in 16 48 60 64 128 256 512; do
    rsvg-convert --width=$sz --height=$sz --format=png --output icon$sz"x"$sz.png < icon.svg
done
