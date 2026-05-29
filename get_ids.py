import urllib.request
import re

url = "https://unsplash.com/s/photos/dentist"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    ids = re.findall(r'"id":"([a-zA-Z0-9_-]{11})"', html)
    print(list(set(ids))[:10])
except Exception as e:
    print(e)
