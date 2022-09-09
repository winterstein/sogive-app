import os
import json
from unittest import result
import requests
from pprint import pprint
import re

os.environ['BING_SEARCH_V7_SUBSCRIPTION_KEY'] = '5472de0e0ef14d96b49311c366d8c2c5'

def bingSearchWebpages(query: str) -> list:
	subscription_key = os.environ['BING_SEARCH_V7_SUBSCRIPTION_KEY']
	endpoint = 'https://api.bing.microsoft.com/v7.0/search'
	
	# Construct a request
	mkt = 'en-US'
	params = { 'q': query, 'mkt': mkt }
	headers = { 'Ocp-Apim-Subscription-Key': subscription_key }

	print(mkt, params, headers)

	# Call the API
	try:
		response = requests.get(endpoint, headers=headers, params=params)
		response.raise_for_status()
		# print("Headers:")
		# print(response.headers)
		# print("JSON Response:")
		# pprint(response.json()['webPages']['value'])
		if len(response.json()['webPages']['value']) > 0:
			return response.json()['webPages']['value']
		else:
			return []
	except Exception as ex:
		raise ex

def bingSearchGetDomains(results: list):
	if len(results) < 1: return

	domainList = []
	for result in results:
		displayUrl = result['displayUrl']
		m = re.search('https?://([A-Za-z_0-9.-]+).*', displayUrl)
		if (m):
			domainUrl = m.group(1)
			if domainUrl not in domainList: domainList.append(domainUrl)
	
	return domainList

def removeListingDomains(domains: list) -> list:
	unwantedDomains = ['charitynavigator', 'opencorporates', 'georgiacompanyregistry', 'guidestar', 'corporationwiki', 'eintaxid', 'dnb', 'facebook', 'twitter']
	topDomains = 3

	topDomains = domains[:topDomains]
	realDomains = []
	for i in topDomains:
		skipping = False
		for j in unwantedDomains:
			if j in i: skipping = True
		if skipping == False: realDomains.append(i)
	print('Numers of real domain(s) in', domains, ':', len(realDomains))
	return realDomains