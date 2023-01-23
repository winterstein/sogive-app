import os
os.chdir('./src/python')

import json
import pandas as pd
import bingSearch

jsonList = []

with open('./data/top100Dumps.json') as readFile:
	jsonList = json.load(readFile)
	readFile.close()

for i in range(len(jsonList)):
	if 'domain' in jsonList[i]: continue
	name = jsonList[i]['name']
	domain = ''
	domain = bingSearch.getFirstResult(name)
	print(name, domain)
	jsonList[i]['domain'] = domain

	with open('./data/top100DumpsDomain.json', 'w') as saveFile:
		saveFile.writelines(json.dumps(jsonList))
		saveFile.close()
