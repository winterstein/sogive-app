import os 
import json
os.chdir('./src/python')

websiteMap = {}

with open('./data/websites.json') as readFile:
	jsonMap = json.load(readFile)
	websiteMap = jsonMap
	readFile.close()

websiteCountingMap = {}
for websites in websiteMap.values():
	for website in websites:
		if website not in websiteCountingMap:
			websiteCountingMap[website] = 1
		else:
			websiteCountingMap[website] += 1

print({k: v for k, v in sorted(websiteCountingMap.items(), key=lambda item: item[1])})


# # cleanup
# import bingSearch

# for k in websiteMap:
# 	print(websiteMap[k])
# 	websiteMap[k] = bingSearch.removeListingDomains(websiteMap[k])

# with open('./data/websites.json', 'w') as saveFile:
# 	saveFile.writelines(json.dumps(websiteMap))
# 	saveFile.close()