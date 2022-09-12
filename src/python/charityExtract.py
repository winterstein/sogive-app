import os
os.chdir('./src/python')

import json
import pandas as pd
import bingSearch

df_charities = pd.read_pickle('./data/pub78.pkl')

websiteMap = {}

try:
	with open('./data/websites.json') as readFile:
		jsonMap = json.load(readFile)
		print(jsonMap)
		websiteMap = jsonMap
		readFile.close()
except:
	print('Error loading websites.json in /data')

# Test run
nameList = df_charities['name'].tolist()[:700]
for i in range(len(nameList)):
	if nameList[i] not in websiteMap:
		domains = bingSearch.nameToDomains(nameList[i])
		websiteMap[nameList[i]] = domains
	else:
		continue

with open('./data/websites.json', 'w') as saveFile:
	saveFile.writelines(json.dumps(websiteMap))
	saveFile.close()