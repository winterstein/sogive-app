import os
os.chdir('./src/python')

import pandas as pd
import bingSearch

df_charities = pd.read_pickle('./data/pub78.pkl')

websiteMap = {}

# Test run
nameList = df_charities['name'].tolist()[:10]
for name in nameList:
	domains = bingSearch.nameToDomains(name)
	print(domains)