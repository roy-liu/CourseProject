from flask import request, Flask
from flask_cors import CORS
import nltk
from nltk.corpus import stopwords
from nltk.stem.wordnet import WordNetLemmatizer
import gensim
from gensim import corpora
from gensim.parsing.preprocessing import preprocess_string, strip_punctuation, strip_numeric
from rank_bm25 import BM25Okapi
import string
import requests
from concurrent.futures import ThreadPoolExecutor
from threading import Thread
import xmltodict
import urllib.parse


executor = ThreadPoolExecutor(2)
app = Flask(__name__)
nltk.download('stopwords')
nltk.download('wordnet')
CORS(app)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
def new_task(doc, author):
    print('Sending request to arxiv for author query: ' + author)
    safe_string = 'http://export.arxiv.org/api/query?search_query=au:' + urllib.parse.quote_plus(author)
    r =requests.get(safe_string)
    papers = xmltodict.parse(r.text)
    # print(papers['feed'])
    texts = []
    ids = []
    titles = []
    bm25 = None
    tokenized_bm25 = []
    print('Parsing Response....')
    print_words = 5
    if r.status_code != 200:
        print('Response error occurred, will not be ranking results, list of relevant topics will be prented at the end')
    if r.status_code == 200:
        for i in range(len(papers['feed']['entry'])):
            texts.append(papers['feed']['entry'][i]['summary'])
            ids.append(papers['feed']['entry'][i]['id'])
            titles.append(papers['feed']['entry'][i]['title'])
        print('Here is a preview of papers this author has written')
        if len(ids) < print_words:
            print_words = len(ids)
        for i in range(print_words):
            print("\t" + str(i+1) + ': ' + titles[i] + ' \n \t\tURL: ' + ids[i])
        print('Tokenizing bm_25')
        tokenized_bm25 = [doc.split(' ') for doc in texts]
        print('Building BM25 for later query')
        bm25 = BM25Okapi(tokenized_bm25)
        print('BM25 successfully completed, parsing pdf now')
    stop = set(stopwords.words('english'))
    exclude = set(string.punctuation)
    lemma = WordNetLemmatizer()
    stop_free = " ".join([i for i in doc.lower().split() if i not in stop])
    print('analyzed stop words...')
    punc_free = ''.join(ch for ch in stop_free if ch not in exclude)
    print('removed punctuation...')
    normalized = " ".join(lemma.lemmatize(word) for word in punc_free.split())
    print('normalized data, building final word list...')
    final_doc = [normalized.split() for d in normalized]
    print('building corpus dictionary (this takes a while)...')
    dictionary = corpora.Dictionary(final_doc)
    print('building term_matrix...')
    term_matric = [dictionary.doc2bow(doc) for doc in final_doc]
    print('running lda (please wait)...')
    Lda = gensim.models.ldamodel.LdaModel
    ldamodel = Lda(term_matric, num_topics=1, id2word = dictionary, passes=3)
    lda_topics = ldamodel.show_topics(num_words=3)
    topics = []
    filters = [lambda x: x.lower(), strip_punctuation, strip_numeric]
    for topic in lda_topics:
        topics.append(preprocess_string(topic[1], filters))
    print(topics)
    query_str = ""
    for t in topics:
        for j in t:
            query_str += j + ' '
    tokenized_query = query_str.split(" ")
    if bm25 != None:
        print('Querying top 3: ')
        scores = bm25.get_scores(tokenized_query)
        highest_scores = sorted(zip(scores, ids, titles), reverse=True)[:print_words]
        print("Relevant Papers Found")
        print("---------------------------------")        
        for j, i in enumerate(highest_scores):
            print( str(j+1) + ': ' + i[2] + " " + i[1] + '\n')
        print("---------------------------------")        
    else:
        print('Request failed earlier please try resubmitting')
    # do bm25 from here on out
    return doc
@app.route("/api/requestSimilarities", methods = ['POST'])
def getBM25():
    doc = request.json['pdf']
    if len(doc) > 10000:
        doc = doc[0:10000]
    author = request.json['author']
    # executor.submit(new_task, doc, author)
    new_task(doc, author)
    return "null"
if __name__ == '__main__':
    app.run(debug = True)