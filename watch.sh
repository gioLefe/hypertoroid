#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="/c/dev/hypertoroid"
WATCH_EXTENSIONS="ts js json"

# Parse command line arguments
CLEAN_DIST=false
ESBUILD_ARGS="--no-clean"

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-clean)
            CLEAN_DIST=false
            ESBUILD_ARGS="--no-clean"
            shift
            ;;
        --clean)
            CLEAN_DIST=true
            ESBUILD_ARGS=""
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--no-clean] [--clean]"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}Starting hypertoroid file watcher...${NC}"
echo -e "${YELLOW}Watching: ${PROJECT_DIR}${NC}"
echo -e "${YELLOW}Extensions: ${WATCH_EXTENSIONS}${NC}"
echo -e "${YELLOW}Command: npx tsc && node esbuild.js ${ESBUILD_ARGS}${NC}"
if [ "$CLEAN_DIST" = false ]; then
    echo -e "${YELLOW}Clean disabled: dist folder will not be cleared${NC}"
fi
echo ""

# Function to run the build
run_build() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] Change detected, rebuilding...${NC}"
    
    cd "${PROJECT_DIR}"
    
    # Run TypeScript compiler first
    npx tsc
    
    # If TypeScript compilation succeeds, run esbuild
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[$(date '+%H:%M:%S')] TypeScript compilation successful, running esbuild...${NC}"
        node esbuild.js $ESBUILD_ARGS
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}[$(date '+%H:%M:%S')] Build completed successfully!${NC}"
        else
            echo -e "${RED}[$(date '+%H:%M:%S')] esbuild failed!${NC}"
        fi
    else
        echo -e "${RED}[$(date '+%H:%M:%S')] TypeScript compilation failed!${NC}"
    fi
    echo ""
}

# Initial build
echo -e "${YELLOW}Running initial build...${NC}"
run_build

# Get the last modification time for comparison
get_files_checksum() {
    find "${PROJECT_DIR}" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" \) \
        ! -path "*/node_modules/*" \
        ! -path "*/.git/*" \
        ! -path "*/dist/*" \
        -exec stat -c "%Y %n" {} \; 2>/dev/null | sort
}

echo -e "${GREEN}Watching for file changes... Press Ctrl+C to stop${NC}"

# Store initial state
last_checksum=$(get_files_checksum | md5sum)

# Watch loop
while true; do
    sleep 1
    
    # Get current state
    current_checksum=$(get_files_checksum | md5sum)
    
    # Compare checksums
    if [ "$current_checksum" != "$last_checksum" ]; then
        run_build
        last_checksum="$current_checksum"
    fi
done