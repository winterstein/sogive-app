**Exec summary**

1. **One section of GiveWell's cost effectiveness model is dedicated to various "supplementary adjustments" for the different charities in the model.**
2. **For these adjustments, GiveWell's priors are (implicitly) that the effect size of each adjustment is zero.**
  1. **While this prior is legitimate in some cases, it is not in general well founded.**
    1. **If the adjustment is positive, the prior that the adjustment is zero is consistent with GiveWell's usual sceptical approach of penalizing uncertainty.**
    2. **This is no longer true if the adjustment is negative (i.e. if it's a downside of the intervention). A prior of zero on a negative adjustment increases the final cost-effectiveness number, which rewards uncertainty and is not consistent with erring towards skepticism and penalizing uncertainty.**
  2. **We recommend investing more effort in modelling some of the adjustments.**
3. **Our exploration of one adjustment – unprogrammed deworming – led to an outcome similar to GiveWell's, by chance.**
  1. **We explored the negative adjustment with the highest impact on the final number in more detail. The adjustment accounted for "unprogrammed deworming"; i.e. deworming which might have counterfactually occurred outside of the programme being modelled or led to repeat deworming tablet doses.**
    1. **After the exploration, we felt that GiveWell's adjustments were not adequately justified given their a priori potential magnitude**
    2. **We also believed the approach was inconsistent with a sceptical prior**
    3. **While our adjustment coincidentally did lead to a very similar final number to GiveWell's, we believe that this is just a coincidence, and a deeper dive might lead to more significant changes.**
4. **An extremely crude estimate of the potential impact of this would be an 8% decline in the cost effectiveness of New Incentives**

**1. One section of GiveWell's cost effectiveness model is dedicated to "supplementary adjustments"**

**Supplementary adjustments refer to considerations which GiveWell considers to be potentially relevant, but which are not rigorously modelled.**

**Examples include the possibility that malaria nets might prevent stillbirths, that mass deworming could lead to drug resistance, or that seasonal malaria chemoprevention could have side effects.**

**The full list of "out of model" supplementary adjustments is provided in Appendix 1**

**2. GiveWell's priors are (implicitly) that the effect size of each adjustment is zero**

**GiveWell's methodology for unmodelled supplementary adjustments is described below. You can see how this is implemented by looking at the table in Appendix 1 or directly in** [**GiveWell's model**](https://docs.google.com/spreadsheets/d/1tytvmV_32H8XGGRJlUzRDTKTHrdevPIYmb_uc6aLeas/edit#gid=819415156) **.**

- **GiveWell comes up with a figure to capture the size of the adjustment - the rough best guess of effect size**
- **GiveWell assesses:**
  - **how well-justified the estimate is**
  - **How easy the estimate is to model**
  - **How consistent it is with the way GiveWell generally models things**
- **The assessments are used to calculate a factor which is applied to the rough best guess**
  - **If the assessments are high for each of those items, the factor could be as high as 90%, meaning that the adjustment is almost given full credit in the model**
  - **If the assessments are low for each of those items, the factor could be as low as 10%, meaning that the adjustment is almost given no credit in the model**

**At a high level, many aspects of the methodology seem reasonable at first glance**

- **Implicit in the methodology is a prior that the effect size is zero**
- **GiveWell often applies a sceptical prior of zero impact, and there are typically good reasons for this. GiveWell** [**has**](https://blog.givewell.org/2009/12/05/a-conflict-of-bayesian-priors/)[**justified**](https://blog.givewell.org/2011/08/18/why-we-cant-take-expected-value-estimates-literally-even-when-theyre-unbiased/)[**this**](https://blog.givewell.org/2008/12/18/guest-post-proven-programs-are-the-exception-not-the-rule/)[**position**](https://80000hours.org/articles/effective-social-program/) **at length.**
  - **In short, it's because GiveWell believes (and SoGive agrees) that achieving positive impact is a very difficult endeavour, so uncertainty should be penalized and in the absence of evidence we should default to the assumption that little-to-no impact is achieved.**

**2a. A prior of zero is not sceptical and uncertainty-averse if applied to negative adjustments**

- **If the adjustment is positive, the prior that the adjustment is zero is consistent with GiveWell's usual sceptical approach.**
  - **For example, one of the adjustments is for the possibility that deworming could have benefits relating to HIV**
  - **Applying a prior of zero is appropriate here – our default or "prior" assumption on this should not be that tackling worms reduces the risk of HIV, it's only something we should believe with sufficient evidence.**
- **This is no longer true if the adjustment is negative (a downside of the intervention)**
  - **In this case, choosing a prior of zero is actually** _ **favourable** _ **to the charity's intervention; this is inconsistent with GiveWell's usual sceptical prior.**
  - **For example, defaulting to a prior of zero impact means that GiveWell's default/prior position is that:**
    - **in the absence of deworming programmes, people would never receive deworming pills (e.g. by going and getting them themselves); or**
    - **mass deworming has zero chance of leading to drug resistance; or**
    - **there is zero chance that there would be negative effects from decreased immunity when people are protected from malaria.**
  - **We do not believe that any of the above statements are reasonable priors.**

**2b. We recommend investing more effort in modelling some of the adjustments**

**In order to improve on this approach, we believe that one of the two following approaches is legitimate:**

1. **Use a prior which is better justified than a prior of zero, in particular avoiding the scenario where an unjustified prior tends to** _ **reward** _ **higher uncertainty adjustments**
2. **Invest more effort in determining the estimate of the adjustment**

**Given that it's hard to come up with a suitable prior without investing more effort in determining the size of the adjustment (i.e. it's hard to do the first without doing the second), we recommend the second approach.**

**Step 1 is to narrow down the list of adjustments – the full list has more than 60 items (see Appendix 1). Doing more detailed analysis on all of these would be excessive.**

**Here are some criteria for narrowing down the list:**

- **Adjustments where the sign is positive are arguably covered adequately by the current method: the prior is more suitable as outlined above.**
- **There are 18 adjustments where the sign is negative.**
- **Of those, 11 adjustments have a magnitude of ≥ 10% (i.e. are ≤ -10%), and of those, 9 have magnitudes exactly equal to -10%, according to GiveWell's raw "rough best guess of effect size" (listed below).**

**Hence it seems that, at the least, it would be suitable for GiveWell to invest more effort into the two adjustments with the largest magnitude of raw "rough best guess of effect size", which are:**

- **Unprogrammed deworming: -35%**
- **Crowding out of New Incentives: -25%**

**It may further be justifiable to invest effort into all of the 11 items listed below.**

_ **Table 1: List of adjustments where the effect is negative** _

| | **Rough best guess of effect size** | **Can it be objectively justified?** | **Ease of modeling** | **Consistency** | **3 criteria score** | **Weighting of best guess of effect** | **Weighted best guess of effect** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AMF** | | | | | | | |
| **Rebound effects / decreased immunity development** | **-10%** | **2** | **1** | **1** | **4** | **40%** | **-4%** |
| **Deworming** | | | | | | | |
| **Drug resistance** | **-10%** | **1** | **1** | **2** | **4** | **40%** | **-4%** |
| **Unprogrammed deworming** | **-35%** | **1** | **1** | **2** | **4** | **40%** | **-14%** |
| **General equilibrium effects** | **-10%** | **1** | **1** | **1** | **3** | **30%** | **-3%** |
| **SMC** | | | | | | | |
| **Rebound effects / decreased immunity development** | **-10%** | **2** | **1** | **1** | **4** | **40%** | **-4%** |
| **Drug resistance** | **-10%** | **1** | **1** | **2** | **4** | **40%** | **-4%** |
| **Cash** | | | | | | | |
| **Changes in PPP and exchange rates** | **-10%** | **3** | **2** | **2** | **7** | **70%** | **-7%** |
| **New Incentives** | | | | | | | |
| **COVID-19 leading to weaker effects of cash incentives and vaccination** | **-10%** | **1** | **1** | **2** | **4** | **40%** | **-4%** |
| **Crowding out of New Incentives** | **-25%** | **2** | **3** | **2** | **7** | **70%** | **-17.5%** |
| **Serotype replacement** | **-10%** | **1** | **1** | **2** | **4** | **40%** | **-4%** |
| **Inflation** | **-10%** | **1** | **2** | **2** | **5** | **50%** | **-5%** |

**In order to illustrate our point, we selected the item on the list which had the largest magnitude (unprogrammed deworming) and modelled it more carefully.**

**(3) Our exploration of one adjustment – unprogrammed deworming – led to an outcome similar to GiveWell's, by chance.**

**Unprogrammed deworming refers to deworming which occurs outside of Mass Drug Administration programmes. This could be self-administered (the beneficiary – or their family – purchases deworming tablets themselves). It could also happen because other NGOs sometimes include deworming alongside other programmes (e.g. Helen Keller is a GiveWell-recommended charity which does this).**

**We did an exercise in considering unprogrammed deworming in more detail.**

**Here are the results, which show that the results are about 2% more favourable. For example, for SCI, the cost effectiveness went from 13.5x cash to 13.8x cash – a modest 2% improvement.**

_ **Table 2: Impact of using SoGive's choice of unprogrammed deworming adjustment on cost-effectiveness** _

| | **Impact on Cost Eff as mult of cash\*** |
| --- | --- |
| **Deworm the World** | **2%** |
| **END fund** | **2%** |
| **SCI** | **2%** |
| **Sightsavers** | **1%** |
| **\* "Cost Eff as mult of cash" is short for "Cost effectiveness as a multiple of cash transfers". This is one of the main measures of cost-effectiveness used by GiveWell.** |

**We calculated this by taking a** [**copy**](https://docs.google.com/spreadsheets/d/1JrYi1vAevWc3XrLJ4ZuRWEtfQUHHBFG3mCxeIu_LepY/edit#gid=1960372681&range=B33:C36) **of the GiveWell cost effectiveness spreadsheet and adjusting** [**cell M47**](https://docs.google.com/spreadsheets/d/1JrYi1vAevWc3XrLJ4ZuRWEtfQUHHBFG3mCxeIu_LepY/edit#gid=819415156&range=M47) **in the supplementary adjustments tab.**

_ **How GiveWell calculated an unprogrammed deworming adjustment of 14%** _

_ **Table 3: How GiveWell modelled unprogrammed deworming** _

| | **Rough best guess of effect size** | **Can it be objectively justified?** | **Ease of modeling** | **Consistency** | **3 criteria score** | **Weighting of best guess of effect** | **Weighted best guess of effect** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Unprogrammed deworming** | **-35%** | **1** | **1** | **2** | **4** | **40%** | **-14%** |

- **The calculation starts with a -35% "rough best guess" adjustment; very little indication is given of how this was determined. GiveWell provides a comment which says: "Deworming separate from national MDAs may be common, but we have little sense of how common it is. Harris et al. 2015, Hafiz et al. 2013, and Addiss 2015 all found relatively high rates of unprogrammed deworming in the studied populations." (Source:** [**Cell I47**](https://docs.google.com/spreadsheets/d/1tytvmV_32H8XGGRJlUzRDTKTHrdevPIYmb_uc6aLeas/edit#gid=819415156&range=A47:N47) **of supplementary adjustments tab in GiveWell's model)**
- **The -35% figure is then adjusted downwards by 40% to reach a final number of -14% as described above. This means GiveWell's final number is** _ **more optimistic** _ **because of the fact that unprogrammed deworming is hard to justify using objective measures and diffcult to model, violating the convention of having a sceptical prior which penalizes uncertainty.**

**As we've indicated, we are unconvinced that the logic behind this approach is appropriate in this case.**

_ **How we calculated an unprogrammed deworming adjustment of 11.7%** _

**We modelled unprogrammed deworming in** [**this spreadsheet**](https://docs.google.com/spreadsheets/d/1Z7iI4sUUNsGlbJQwBPKtFsBG__DRV_NfdvLMT06HtEU/edit#gid=1850503836) **. Our calculations are summarised below:**

_ **Table 4: Overview of SoGive's calculation of the unprogrammed deworming adjustment** _

| **Unprogrammed deworming rate over a 6 month period** | **20%** | **This is based on one Deworm the world report (https://files.givewell.org/files/DWDA%202009/DtWI/Deworm\_the\_World\_Kenya\_PMCV\_report\_2020.pdf ) Given that this is coming from just one source, it is a non-resilient estimate which would benefit from further research. The details behind this are expanded on in the spreadsheet. If we had more time, we would likely have reviewed each of the studies and applied a generalisability factor to each, and then taken a weighted average.** |
| --- | --- | --- |
| **Unprogrammed deworming rate (estimated over a 1 year period)** | **36%** | **This calculation is explained in the spreadsheet** |
| **Unprogrammed deworming rate implicit in the original miguel and kremer study** | **5%** | [**https://www.nber.org/system/files/working\_papers/w21428/w21428.pdf**](https://www.nber.org/system/files/working_papers/w21428/w21428.pdf) |
| _ **Extent to which worms are expected to have returned after 6 months: A. lumbricoides** _ | _ **68%** _ | [**https://pubmed.ncbi.nlm.nih.gov/22590656/**](https://pubmed.ncbi.nlm.nih.gov/22590656/) |
| _ **Extent to which worms are expected to have returned after 6 months: T. trichiura** _ | _ **67%** _ | [**https://pubmed.ncbi.nlm.nih.gov/22590656/**](https://pubmed.ncbi.nlm.nih.gov/22590656/) |
| _ **Extent to which worms are expected to have returned after 6 months: hookworm** _ | _ **55%** _ | [**https://pubmed.ncbi.nlm.nih.gov/22590656/**](https://pubmed.ncbi.nlm.nih.gov/22590656/) |
| _ **Extent to which worms are expected to have returned after 6 months: schistosomes** _ | _ **9.8%** _ | **Yan Jin et al 2021 (https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8583024/) -- a fuller literature review was not performed, and would likely lead to a fuller picture of schisto reinfection rates -- this source is just for Sudan** |
| **Extent to which worms are expected to have returned after 6 months: overall** | **50%** | **Several deworming orgs tackle a mix of worms -- e.g. even SCI (whose name suggests they are focused on schistosomes) also deworm against other worms (because there's minimal extra cost). This is consistent with the original Miguel and Kremer study, which administered both albendazole (which covers A. lumbricoides, T. trichiura, and hookworm) and praziquantel (which covers schistosomes). So a figure which covers a mix of worms is suitable. It's not clear that this straight average is appropriate -- arguably some of those worms are more important than others. However adjusting the number to be equal to the outlier (schistosomes) does not lead to a very dramatic change** |
| **Proportion of unprogrammed deworming which uses generic drugs** | **90%** | **This is a judgement-based figure. Most of the beneficiaries are among the world's poorest people, so they are likely to opt for cheaper choices. Similarly, if NGOs are conducting deworming alongside other interventions, including non-generic deworming drugs would likely add a non-trivial extra cost to their programme. This figure could be improved with further research.** |
| **Proportion of generic drugs which pass pharmacological tests** | **46%** | "**Not more than 46.3% (31 / 67) of the tablets assayed passed the respective pharmaceutical criteria for dissolution. "**[**https://journals.plos.org/plosntds/article?id=10.1371/journal.pntd.0009038**](https://journals.plos.org/plosntds/article?id=10.1371/journal.pntd.0009038) **" Overall, 45.3% (48/106) of the tested samples were substandard, i.e. not meeting the pharmacopoeial quality specifications claimed by their manufacturers. " https://journals.plos.org/plosntds/article?id=10.1371/journal.pntd.0003345** |
| **Effectiveness of generic drugs which don't pass pharmacological tests** | **50%** | **This is a judgement-based figure. This figure could be improved with further research.** |
| **Adjustment for unprogrammed deworming** | **11.7%** | **See spreadsheet for more on how this was calculated** |

**As can be seen from the above, the difference between the SoGive adjustment (11.7%) and the GiveWell adjustment (14%) is modest, and leads to a modest (2%) difference in the cost-effectiveness result.**

**However, this occurred by chance.**

**As can be seen from the above, the methods used to calculate the two figures are very different, and it would have been unsurprising if the two figures had come out to be very different. Furthermore, several elements of the model have been determined using subjective judgement, and further research could lead to the number changing materially.**

**Hence we believe that, at least for the other large negative adjustment (Crowding out of New Incentives) and possibly for some of the others, further modelling such as the above should be conducted.**

**(4) An extremely crude estimate of the potential impact of this would be an 8% decline in the cost effectiveness of New Incentives**

**This estimate was determined simply by skipping the adjustments and setting the used adjustment equal to the raw "rough best guess" figure. This is a substantially cruder method than the approach outlined above for unprogrammed deworming, however it gives a reasonable indication of the potential scale of the effect.**

**This causes the New Incentives cost effectiveness to decline by 8%, as shown in** [**this spreadsheet**](https://docs.google.com/spreadsheets/d/1JrYi1vAevWc3XrLJ4ZuRWEtfQUHHBFG3mCxeIu_LepY/edit#gid=1960372681&range=B39:E39) **.**

**Appendix 1: Full list of GiveWell's "out of model" supplementary adjustments**

**The below table is taken from GiveWell's** [**Supplementary adjustments tab in their cost-effectiveness model**](https://docs.google.com/spreadsheets/d/1tytvmV_32H8XGGRJlUzRDTKTHrdevPIYmb_uc6aLeas/edit#gid=819415156) **.**

**It includes only the "out of model" adjustments, i.e. items which GiveWell captures more rigorously in the main model are left out of the list below.**

**Veteran followers of GiveWell's models will recognise them as "unmodelled" adjustments, to use the term employed in earlier models.**

| | **Rough best guess of effect size** | **Can it be objectively justified?** | **Ease of modeling** | **Consistency** | **3 criteria score** | **Weighting of best guess of effect** | **Weighted best guess of effect** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AMF** | | | | | | | |
| **Malaria morbidity** | **15%** | **3** | **2** | **1** | **6** | **60%** | **9%** |
| **Short-term anemia effects** | **15%** | **3** | **2** | **1** | **6** | **60%** | **9%** |
| **Prevention of diseases other than malaria (e.g. dengue, yellow fever, zika, encephalitis)** | **5%** | **2** | **1** | **1** | **4** | **40%** | **2%** |
| **Prevention of stillbirths** | **10%** | **3** | **3** | **3** | **9** | **90%** | **9%** |
| **Investment of income increases** | **5%** | **1** | **2** | **2** | **5** | **50%** | **2.5%** |
| **Rebound effects / decreased immunity development** | **-10%** | **2** | **1** | **1** | **4** | **40%** | **-4%** |
| **Effect on fertility** | **?** | **1** | **1** | **1** | **3** | **30%** | **Not specified** |
| **Treatment costs averted from prevention** | **10%** | **3** | **2** | **1** | **6** | **60%** | **6%** |
| **Subnational adjustments** | **3%** | **3** | **3** | **2** | **8** | **80%** | **2.4%** |
| **Marginal funding goes to lower priority areas** | **Varies by country** | **2** | **1** | **2** | **5** | **50%** | **Not specified** |
| **Mosquito insecticide resistance in trials underlying our estimates** | **10%** | **2** | **2** | **1** | **5** | **50%** | **5%** |
| **Differences in mosquito species** | **-5%** | **1** | **2** | **1** | **4** | **40%** | **-2%** |
| **Adjustment for program impact being to move distributions closer together** | **Varies by country** | **2** | **1** | **2** | **5** | **50%** | **Not specified** |
| **Deworming** | | | | | | | |
| **Direct health effects** | **2%** | **2** | **1** | **1** | **4** | **40%** | **0.8%** |
| **HIV reduction** | **10%** | **2** | **2** | **2** | **6** | **60%** | **6%** |
| **Possible increases in diseases of affluence (harms of deworming)** | **-5%** | **2** | **1** | **2** | **5** | **50%** | **-2.5%** |
| **Averted mortality** | **5%** | **1** | **3** | **3** | **7** | **70%** | **3.5%** |
| **Short-term anemia effects** | **15%** | **3** | **2** | **1** | **6** | **60%** | **9%** |
| **Investment of income increases** | **20%** | **1** | **2** | **2** | **5** | **50%** | **10%** |
| **Non-income long-run benefits of deworming** | **40%** | **0** | **0** | **1** | **1** | **10%** | **4%** |
| **Other NTD prevention (relevant to Sightsavers and END Fund)** | **20%** | **3** | **2** | **2** | **7** | **70%** | **14%** |
| **Drug resistance** | **-10%** | **1** | **1** | **2** | **4** | **40%** | **-4%** |
| **Unprogrammed deworming** | **-35%** | **1** | **1** | **2** | **4** | **40%** | **-14%** |
| **Marginal funding goes to lower priority areas** | **-5%** | **2** | **1** | **2** | **5** | **50%** | **-2.5%** |
| **General equilibrium effects** | **-10%** | **1** | **1** | **1** | **3** | **30%** | **-3%** |
| **SMC** | | | | | | | |
| **Malaria morbidity** | **15%** | **3** | **2** | **1** | **6** | **60%** | **9%** |
| **Short-term anemia effects** | **15%** | **3** | **2** | **1** | **6** | **60%** | **9%** |
| **Investment of income increases** | **10%** | **1** | **2** | **2** | **5** | **50%** | **5%** |
| **Rebound effects / decreased immunity development** | **-10%** | **2** | **1** | **1** | **4** | **40%** | **-4%** |
| **Drug resistance** | **-10%** | **1** | **1** | **2** | **4** | **40%** | **-4%** |
| **Effect on fertility** | **?** | **1** | **1** | **1** | **3** | **30%** | **Not specified** |
| **Treatment costs averted from prevention** | **10%** | **3** | **2** | **1** | **6** | **60%** | **6%** |
| **Subnational adjustments** | **4%** | **3** | **3** | **2** | **8** | **80%** | **3.2%** |
| **Marginal funding goes to lower priority areas** | **Varies by country** | **2** | **1** | **2** | **5** | **50%** | **Not specified** |
| **Counterfactual mortality rates** | **-2%** | **2** | **3** | **3** | **8** | **80%** | **-1.6%** |
| **Serious adverse events due to side effects of treatment** | **-1%** | **3** | **2** | **1** | **6** | **60%** | **-0.6%** |
| **Failure to ingest first day of treatment of SMC** | **-5%** | **3** | **2** | **2** | **7** | **70%** | **-3.5%** |
| **HKI** | | | | | | | |
| **Mortality effects** | | **3** | **3** | **3** | **9** | **90%** | **0%** |
| **Development effects** | | **1** | **1** | **3** | **5** | **50%** | **0%** |
| **Short-term consequences of reduced infectious disease morbidity** | **15%** | **2** | **1** | **1** | **4** | **40%** | **6%** |
| **Short-term anemia effects** | **15%** | **3** | **2** | **1** | **6** | **60%** | **9%** |
| **Investment of income increases** | **5%** | **1** | **2** | **3** | **6** | **60%** | **3%** |
| **Vision benefits** | **15%** | **2** | **2** | **2** | **6** | **60%** | **9%** |
| **Benefits from other programs supported by our funding (e.g. deworming, immunizations)** | **30%** | **2** | **2** | **2** | **6** | **60%** | **18%** |
| **Interaction between VAS and vaccines** | **5%** | **1** | **1** | **1** | **3** | **30%** | **1.5%** |
| **Effect on fertility** | **?** | **1** | **1** | **1** | **3** | **30%** | **Not specified** |
| **Treatment costs averted from prevention** | **10%** | **3** | **2** | **1** | **6** | **60%** | **6%** |
| **Marginal funding goes to lower priority areas** | **0%** | **2** | **1** | **2** | **5** | **50%** | **0%** |
| **Cash** | | | | | | | |
| **Changes in PPP and exchange rates** | **-10%** | **3** | **2** | **2** | **7** | **70%** | **-7%** |
| **Developmental effects** | **10%** | **1** | **2** | **2** | **5** | **50%** | **5%** |
| **Reduced morbidity** | **10%** | **1** | **2** | **1** | **4** | **40%** | **4%** |
| **Child mortality effects** | **10%** | **1** | **2** | **1** | **4** | **40%** | **4%** |
| **New Incentives** | | | | | | | |
| **Lower likelihood of infecting others** | **10%** | **2** | **2** | **2** | **6** | **60%** | **6%** |
| **Herd immunity** | **25%** | **2** | **1** | **2** | **5** | **50%** | **12.5%** |
| **Morbidity effects from directly incentivized vaccines and rotavirus** | **10%** | **3** | **2** | **1** | **6** | **60%** | **6%** |
| **Mortality effects of indirectly incentivized vaccines besides rotavirus (i.e., polio, yellow fever, rubella, mumps, varicella meningitis A)** | **4%** | **3** | **3** | **3** | **9** | **90%** | **3.6%** |
| **Morbidity effects of indirectly incentivized vaccines besides rotavirus (i.e., polio, yellow fever, rubella, mumps, varicella meningitis A)** | **1%** | **3** | **3** | **1** | **7** | **70%** | **0.7%** |
| **Effects during outbreaks** | **10%** | **2** | **1** | **1** | **4** | **40%** | **4%** |
| **COVID-19 leading to greater effects of cash incentives and vaccination** | **10%** | **1** | **1** | **2** | **4** | **40%** | **4%** |
| **COVID-19 leading to weaker effects of cash incentives and vaccination** | **-10%** | **1** | **1** | **2** | **4** | **40%** | **-4%** |
| **Crowding out of New Incentives** | **-25%** | **2** | **3** | **2** | **7** | **70%** | **-17.5%** |
| **Vaccine-derived polio outbreaks** | **-5%** | **1** | **1** | **2** | **4** | **40%** | **-2%** |
| **Serotype replacement** | **-10%** | **1** | **1** | **2** | **4** | **40%** | **-4%** |
| **Inflation** | **-10%** | **1** | **2** | **2** | **5** | **50%** | **-5%** |
| **Treatment costs/economic losses averted from prevention** | **10%** | **3** | **2** | **1** | **6** | **60%** | **6%** |
| **Increased timeliness of vaccination** | **5%** | **2** | **3** | **2** | **7** | **70%** | **3.5%** |
| **Investment of income increases** | **10%** | **1** | **2** | **2** | **5** | **50%** | **5%** |
| **Increased clinic utilization** | **0%** | **2** | **1** | **2** | **5** | **50%** | **0%** |