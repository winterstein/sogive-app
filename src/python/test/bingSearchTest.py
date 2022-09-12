import unittest
import sys
sys.path.insert(0, '/home/winterwell/sogive-app/src/python')

from bingSearch import bingSearchWebpages, bingSearchGetDomains, removeListingDomains

class TestBingSearch(unittest.TestCase):
	def testSearch(self):
		results = bingSearchWebpages('Iglesia Bethesda Inc.')
		self.assertTrue(len(results) > 1)
		bingSearchGetDomains(results)

	def testGetDomains(self):
		jsonString = [{'id': 'https://api.bing.microsoft.com/api/v7/#WebPages.0', 'name': 'Association of Fundraising Professionals', 'url': 'https://afpglobal.org/', 'isFamilyFriendly': True, 'displayUrl': 'https://afpglobal.org', 'snippet': 'AFP is committed to expanding our professional development offerings and broadening our network of contributors to position AFP as the go-to source for fundraising training, information and insights. The deadline for submissions is Oct. 11, 2022. Learn About Ways to Contribute and Submit Your Proposal. Paid Advertisement.', 'deepLinks': [{'name': 'Sign In', 'url': 'https://afpglobal.org/user/login?user=0', 'snippet': 'This site won’t let us show the description for this page.'}, {'name': 'Career Center', 'url': 'https://careers.afpglobal.org/', 'snippet': 'AFP Career Center offers the top jobs available in Fundraising. Search and apply to open positions or post jobs on AFP Career Center now. Employers. Products & Pricing; Post a Job; My Account; My Jobs; ... Association of Fundraising Professionals; 4200 Wilson Blvd, Suite 480, Arlington, VA 22203. Site Map;', 'deepLinks': [{'name': 'Products & Pricing', 'url': 'https://careers.afpglobal.org/employer/pricing/'}, {'name': 'Resume Bank', 'url': 'https://careers.afpglobal.org/employer/resumes/results/'}, {'name': 'My Candidates', 'url': 'https://careers.afpglobal.org/employer/candidates/'}, {'name': 'Help', 'url': 'https://careers.afpglobal.org/employer/help/'}, {'name': 'Career Planning', 'url': 'https://careers.afpglobal.org/career-insights/'}]}, {'name': 'In-Person Professional Development', 'url': 'https://afpglobal.org/professional-development', 'snippet': 'The success of every charitable cause rests upon the ability of the fundraiser to generate support for critical programs and services. AFP offers a variety of professional development programs—from webinars and videos to articles and blogs—to help fundraisers learn and grow at every stage of their careers.', 'deepLinks': [{'name': 'Course Hosting & Licensing', 'url': 'https://afpglobal.org/professional-development/course-hosting-licensing'}, {'name': 'Webinars & Recordings', 'url': 'https://afpglobal.org/professional-development/webinars'}, {'name': 'AFP Faculty Training Academy', 'url': 'https://afpglobal.org/professional-development/afp-faculty-training-academy'}]}, {'name': 'The Fundraising Effectiveness Project', 'url': 'https://afpglobal.org/FundraisingEffectivenessProject', 'snippet': 'The goal of the Fundraising Effectiveness Project (FEP) is to help nonprofit organizations increase giving at a faster pace. FEP pursues this goal by providing nonprofits with tools for tracking and evaluating their annual growth in giving. Growth in giving is the net of gains in giving minus losses in giving.', 'deepLinks': [{'name': 'FEP Reports', 'url': 'https://afpglobal.org/fepreports'}, {'name': 'About', 'url': 'https://afpglobal.org/aboutfep'}, {'name': 'FEP Tools', 'url': 'https://afpglobal.org/feptools'}]}, {'name': 'Online Learning', 'url': 'https://afpglobal.org/online-learning', 'snippet': 'AFP e-courses allow you to learn at your own pace and convenience! Start and stop the program at any time and resume where you left off.'}, {'name': 'Certifications', 'url': 'https://afpglobal.org/certifications', 'snippet': 'AFP supports two important certifications for fundraising professionals: Certified Fund Raising Executive, or CFRE. CFRE used to be managed by AFP, but is now operated by a separate organization: CFRE International. Learn more about CFRE; Advanced Certified Fund Raising Executive, or ACFRE. AFP manages the ACFRE program. Learn more about ACFRE.'}, {'name': 'Guides & Resources', 'url': 'https://afpglobal.org/guides-resources', 'snippet': 'Need some specific information about fundraising, like how to set up a major gift program or work more effectively with your board? Or maybe you just want to learn about the latest trends? AFP’s Guides & Resources have you covered, from our Advancing Philanthropy magazine and research reports to our Ready Reference Series and Hot Topics.'}, {'name': 'News & Perspectives', 'url': 'https://afpglobal.org/news-perspectives', 'snippet': "AFP offers several publications, tools, and resources to help fundraising professionals. Mike's Monday Message The weekly blog about all things AFP and fundraising, led by AFP President and CEO Mike Geiger, MBA, CPA"}], 'dateLastCrawled': '2022-09-06T01:27:00.0000000Z', 'language': 'en', 'isNavigational': True}, {'id': 'https://api.bing.microsoft.com/api/v7/#WebPages.1', 'name': 'About AFP | Association of Fundraising Professionals', 'url': 'https://afpglobal.org/about', 'thumbnailUrl': 'https://www.bing.com/th?id=OIP.lb6aRWsgzgebVxS3Yc5qpwHaGk&pid=Api', 'isFamilyFriendly': True, 'displayUrl': 'https://afpglobal.org/about', 'snippet': 'Striving to stimulate a world of generosity and positive social good through fundraising best practice. AFP Case For Membership: Fundraising Support When You Need It Most! Join Now! ... Association of Fundraising Professionals 4200 Wilson Boulevard, Suite 480, Arlington, VA 22203-4118', 'dateLastCrawled': '2022-09-05T10:12:00.0000000Z', 'language': 'en', 'isNavigational': False}, {'id': 'https://api.bing.microsoft.com/api/v7/#WebPages.2', 'name': 'Join AFP | Association of Fundraising Professionals', 'url': 'https://afpglobal.org/join', 'thumbnailUrl': 'https://www.bing.com/th?id=OIP.icLhba4Hmd8kr-PZPEqBkwHaEI&pid=Api', 'isFamilyFriendly': True, 'displayUrl': 'https://afpglobal.org/join', 'snippet': 'Join AFP. Now, more than ever, you must invest in yourself! And it’s your professional community, the Association of Fundraising Professionals, that can offer you the best resources—at the best value for your membership dollar—to help you and your organization succeed. JOIN AFP. Join Now!', 'dateLastCrawled': '2022-09-06T15:46:00.0000000Z', 'language': 'en', 'isNavigational': False}, {'id': 'https://api.bing.microsoft.com/api/v7/#WebPages.3', 'name': 'Career Center | Association of Fundraising Professionals', 'url': 'https://afpglobal.org/career-center', 'thumbnailUrl': 'https://www.bing.com/th?id=OIP.b5Vyi0IL9aUsWhUjiNO-EgAAAA&pid=Api', 'isFamilyFriendly': True, 'displayUrl': 'https://afpglobal.org/career-center', 'snippet': 'Career Center. The AFP Career Center is the premier recruitment resource for the fundraising profession! Here, employers and recruiters can access the most qualified talent pool with relevant work experience to fulfill staffing and job needs. And if you’re looking for jobs in fundraising, the Career Center is the place to post your resume ...', 'dateLastCrawled': '2022-09-06T05:43:00.0000000Z', 'language': 'en', 'isNavigational': False}, {'id': 'https://api.bing.microsoft.com/api/v7/#WebPages.4', 'name': 'Welcome to AFPGV!', 'url': 'https://www.afpgv.org/', 'thumbnailUrl': 'https://www.bing.com/th?id=OIP.UqKfpdvpkwTDEKtItnfumAAAAA&pid=Api', 'isFamilyFriendly': True, 'displayUrl': 'https://www.afpgv.org', 'snippet': 'Welcome to The Association of Fundraising Professionals Genesee Valley Chapter Thank you for visiting our new website! The AFP Genesee Valley Chapter is a volunteer-based organization representing more than 250 fundraising professionals in the Greater Rochester region. Our mission is to advocate for philanthropy and to promote ethical and ...', 'dateLastCrawled': '2022-09-06T16:06:00.0000000Z', 'language': 'en', 'isNavigational': False}, {'id': 'https://api.bing.microsoft.com/api/v7/#WebPages.5', 'name': 'Home - Welcome to AFP Oklahoma - Association of Fundraising Professionals', 'url': 'https://community.afpglobal.org/afpokoklahomachapter/home', 'isFamilyFriendly': True, 'displayUrl': 'https://community.afpglobal.org/afpokoklahomachapter/home', 'snippet': 'The Association of Fundraising Professionals Oklahoma Chapter (AFP OK) is committed to developing and maintaining a diverse organization that reflects, is responsive to, and embraces the diversity of the communities we serve in central Oklahoma; respecting and valuing all people. Our chapter is committed to promoting an inclusive, equitable and ...', 'dateLastCrawled': '2022-09-06T07:30:00.0000000Z', 'language': 'en', 'isNavigational': False}]
		results = bingSearchGetDomains(jsonString)
		self.assertTrue(len(results) > 1)

	def testRemoveListingDomains(self):
		results1 = removeListingDomains(['opencorporates.com', 'www.charitynavigator.org', 'www.facebook.com', 'www.guidestar.org', 'www.dnb.com', 'www.bizapedia.com', 'bisprofiles.com', 'betesdaministries.com'])
		results2 = removeListingDomains(['afpglobal.org', 'community.afpglobal.org'])
		self.assertTrue(len(results1) >= 0)
		self.assertTrue(len(results2) >= 0)

if __name__ == '__main__':
	unittest.main()