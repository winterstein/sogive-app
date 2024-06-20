# Parse and pickle data downloaded from 
# https://www.irs.gov/charities-non-profits/tax-exempt-organization-search-bulk-data-downloads
# Filter to public charity only
# https://www.irs.gov/charities-non-profits/tax-exempt-organization-search-deductibility-status-codes

import pandas as pd
import os

data = open("/home/wing/Downloads/data-download-pub78.txt")
df = pd.read_csv(data, delimiter='|', header=None)
df = df.rename(columns={0: 'id', 1:'name', 2:'city', 3:'state', 4:'country', 5:'deductibility'})
df_pc = df[df['deductibility'] == 'PC']

os.chdir('./src/python')
df_pc.to_pickle('./data/pub78.pkl')