#!/bin/sh

BASE_URL="http://${PWD##*/}.$(hostname)"
OUTPUT_FILE="sitemap.xml"

echo '<?xml version="1.0" encoding="UTF-8"?>' > $OUTPUT_FILE
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' >> $OUTPUT_FILE

for file in ./*.html; do

	# Path
	path="${file#./}"
	url_path=$(echo $path | sed 's/ /%20/g') #Replace spaces

	# Date
	lastmod=$(date -r "$file" +"%Y-%m-%dT%H:%M:%S%z")
	lastmod="${lastmod%??}:${lastmod: -2}"

	# Priority
	if [[ "$file" == "./index.html" ]]; then
		priority="1.0"
	else
		priority="0.8"
	fi

	echo "  <url>" >> $OUTPUT_FILE
	echo "    <loc>${BASE_URL}/${url_path}</loc>" >> $OUTPUT_FILE
	echo "    <lastmod>${lastmod}</lastmod>" >> $OUTPUT_FILE
	echo "    <priority>${priority}</priority>" >> $OUTPUT_FILE
	echo "  </url>" >> $OUTPUT_FILE
done

echo '</urlset>' >> $OUTPUT_FILE
