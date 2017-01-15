import urllib,urllib2
import BeautifulSoup

def get_news():
	url = 'http://http://www.acsu.buffalo.edu/~kuiren/index.html'
	try:
		response = urllib2.urlopen(url)
	except Exception,e:
		print e
		return -1
	data = response.read()
	soup = BeautifulSoup.BeautifulSoup(''.join(data))
	try:
		book_info = soup.find("li",{"div":"news"})
	except Exception,e:
		print e
		return -1
	print book_info
