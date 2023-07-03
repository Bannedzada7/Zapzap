#!/bin/bash

apt update -y && apt upgrade -y
clear
apt install git -y
clear
echo "Enviando para o git..."
git add .
git commit -am "v2.0.0"
git push https://bannedzada7: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@github.com/Bannedzada7/banned-bot.git --all
#  clear
echo "Git enviado com sucesso."