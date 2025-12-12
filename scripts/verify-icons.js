#!/usr/bin/env node

/**
 * Icon Verification Script
 * 
 * This script verifies that all icon imports in the project are valid
 * according to the @iconify-json/fluent package.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ICON_IMPORT_REGEX = /~icons\/fluent\/([a-z0-9-]+)/g;
const EXCLUDED_DIRS = ['node_modules', 'dist', '.git', 'coverage'];

// Known valid Fluent icons (add more as needed)
const KNOWN_VALID_ICONS = [
    'speaker-2-24-filled',
    'speaker-mute-24-filled',
    'play-24-filled',
    'pause-24-filled',
    'next-24-filled',
    'money-24-filled',
    'money-24-regular',
    'heart-24-filled',
    'trophy-24-filled',
    'weather-hail-night-24-filled',
    'building-24-regular',
];

function findFiles(dir, fileList = []) {
    const files = readdirSync(dir);

    files.forEach(file => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            if (!EXCLUDED_DIRS.includes(file)) {
                findFiles(filePath, fileList);
            }
        } else if (['.tsx', '.ts', '.jsx', '.js'].includes(extname(file))) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

function extractIconImports(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    const matches = [...content.matchAll(ICON_IMPORT_REGEX)];
    return matches.map(match => ({
        icon: match[1],
        file: filePath,
    }));
}

function main() {
    console.log('🔍 Verifying icon imports...\n');

    const files = findFiles('src');
    const allIcons = [];
    const unknownIcons = [];

    files.forEach(file => {
        const icons = extractIconImports(file);
        icons.forEach(({ icon, file }) => {
            allIcons.push({ icon, file });

            if (!KNOWN_VALID_ICONS.includes(icon)) {
                unknownIcons.push({ icon, file });
            }
        });
    });

    console.log(`📊 Found ${allIcons.length} icon imports across ${files.length} files\n`);

    if (allIcons.length === 0) {
        console.log('⚠️  No icon imports found!\n');
        return;
    }

    // Group by icon name
    const iconGroups = allIcons.reduce((acc, { icon, file }) => {
        if (!acc[icon]) {
            acc[icon] = [];
        }
        acc[icon].push(file);
        return acc;
    }, {});

    console.log('✅ Icons in use:\n');
    Object.entries(iconGroups).forEach(([icon, files]) => {
        const status = KNOWN_VALID_ICONS.includes(icon) ? '✓' : '⚠️';
        console.log(`   ${status} ${icon} (used in ${files.length} file${files.length > 1 ? 's' : ''})`);
    });

    if (unknownIcons.length > 0) {
        console.log('\n⚠️  Unknown icons (not in verified list):\n');
        unknownIcons.forEach(({ icon, file }) => {
            console.log(`   - ${icon} in ${file}`);
        });
        console.log('\n💡 These icons might be valid but are not in the verified list.');
        console.log('   Verify them at: https://icon-sets.iconify.design/fluent/\n');
    } else {
        console.log('\n✅ All icons are verified!\n');
    }

    // Summary
    console.log('📋 Summary:');
    console.log(`   Total icons: ${Object.keys(iconGroups).length}`);
    console.log(`   Verified: ${Object.keys(iconGroups).length - unknownIcons.length}`);
    console.log(`   Unknown: ${unknownIcons.length}\n`);
}

main();
