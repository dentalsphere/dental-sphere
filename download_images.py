import time
import urllib.request
from duckduckgo_search import DDGS

services = {
    # Services
    "img_cleaning.jpg": "professional dental cleaning scaling patient photo high quality",
    "img_extraction.jpg": "dental tooth extraction procedure dentist photo high quality",
    "img_xray.jpg": "dental digital x-ray RVG sensor scan clinic high quality photo",
    "img_implants.jpg": "dental implant procedure close up realistic photo high quality",
    "img_braces.jpg": "dental braces and clear aligners patient smile high quality photo",
    "img_dentures.jpg": "complete flexible dentures prosthetic realistic high quality photo",
    "img_rootcanal.jpg": "root canal endodontic treatment dentist professional photo",
    "img_crowns.jpg": "dental crowns and bridges zirconia high quality photo",
    "img_cosmetic.jpg": "cosmetic dentistry perfect smile veneers high quality photo",
    # Education
    "edu_brushing.jpg": "proper teeth brushing technique patient smiling photo",
    "edu_flossing.jpg": "dental flossing teeth hygiene photo",
    "edu_diet.jpg": "healthy diet oral health fruits smile photo",
    "edu_rootcanal.jpg": "root canal anatomy explanation diagram realistic",
    "edu_implant_bridge.jpg": "dental implant vs bridge realistic photo",
    "edu_pediatric.jpg": "pediatric dentistry child at dentist smiling photo"
}

ddgs = DDGS()

for filename, query in services.items():
    print(f"Searching for {filename} with query: {query}")
    try:
        results = ddgs.images(query, max_results=10)
        for res in results:
            url = res.get('image')
            if url:
                try:
                    print(f"Downloading {url}")
                    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=10) as response, open(filename, 'wb') as out_file:
                        data = response.read()
                        out_file.write(data)
                    print(f"Saved {filename}")
                    break # Break if successful
                except Exception as e:
                    print(f"Failed to download {url}: {e}")
    except Exception as e:
        print(f"Failed search for {filename}: {e}")
    
    time.sleep(1)
