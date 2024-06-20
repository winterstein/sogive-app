from asyncore import write
from pydoc import describe
from urllib import request
from bs4 import BeautifulSoup
import requests
import os
os.chdir('./src/python')
import json

html = open('./data/top100.html')
soup = BeautifulSoup(html, features='lxml')

top100 = soup.find_all('a', {'class': 'table-row'})

# convert html to map
topList = []
for i in top100:
  link = i['href']
  rank = i.find('div', {'class': 'rank'}).text.replace('.', '')
  name = i.find('div', {'class': 'organizationName'}).text.strip()
  industry = i.find('div', {'class': 'industry'}).text.strip()
  revenuePrivateDonations = i.find('div', {'class': 'revenuePrivateDonations'}).text.strip()
  revenue = i.find('div', {'class': 'revenue'}).text.strip()
  fundraisingEfficiency = i.find('div', {'class': 'fundraisingEfficiency'}).text.strip()
  charitableCommitment = i.find('div', {'class': 'charitableCommitment'}).text.strip()

  print('Fetching details for', rank, name)
  details = requests.get(link).text
  subSoup = BeautifulSoup(details, features='lxml')
  description = subSoup.find('div', {'class': 'listuser-content__bio--copy'}).text

  topList.append(
    {
      'rank': rank,
      'link': link,
      'name': name,
      'industry': industry,
      'revenuePrivateDonations': revenuePrivateDonations,
      'revenue': revenue,
      'fundraisingEfficiency': fundraisingEfficiency,
      'charitableCommitment': charitableCommitment,
      'description': description
    }
  )

# print(topList)

with open('./data/top100Dumps.json', 'w') as writeFile:
  jsonstr = json.dumps(topList)
  writeFile.write(jsonstr)