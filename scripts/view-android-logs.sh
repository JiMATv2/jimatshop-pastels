#!/bin/bash
# View Android logs for JimatShop app

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

APP_PACKAGE="com.yithanglee.jimatshoppastels"

echo -e "${GREEN}Android Log Viewer for JimatShop${NC}"
echo -e "${BLUE}Package: ${APP_PACKAGE}${NC}"
echo ""
echo "Options:"
echo "  1) View all logs"
echo "  2) View app-specific logs (filtered)"
echo "  3) View errors and warnings only"
echo "  4) View Capacitor logs"
echo "  5) Clear logs and start fresh"
echo "  6) Save logs to file"
echo ""
read -p "Select option (1-6): " option

case $option in
  1)
    echo -e "${GREEN}Viewing all logs...${NC}"
    adb logcat
    ;;
  2)
    echo -e "${GREEN}Viewing app-specific logs...${NC}"
    adb logcat | grep -i "jimatshop\|${APP_PACKAGE}\|chromium"
    ;;
  3)
    echo -e "${YELLOW}Viewing errors and warnings only...${NC}"
    adb logcat *:E *:W
    ;;
  4)
    echo -e "${BLUE}Viewing Capacitor logs...${NC}"
    adb logcat | grep -i "capacitor\|cordova"
    ;;
  5)
    echo -e "${YELLOW}Clearing logs...${NC}"
    adb logcat -c
    echo -e "${GREEN}Starting fresh log viewer...${NC}"
    adb logcat | grep -i "jimatshop\|${APP_PACKAGE}\|capacitor"
    ;;
  6)
    filename="android-logs-$(date +%Y%m%d-%H%M%S).txt"
    echo -e "${GREEN}Saving logs to ${filename}...${NC}"
    adb logcat > "$filename"
    echo -e "${GREEN}Logs saved! Press Ctrl+C to stop.${NC}"
    ;;
  *)
    echo -e "${RED}Invalid option${NC}"
    exit 1
    ;;
esac

