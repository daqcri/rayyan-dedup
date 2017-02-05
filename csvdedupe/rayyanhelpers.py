from csvhelpers import preProcess
import psycopg2;
import urlparse

class RayyanDBConnector:
    def __init__(self, dbstring):
        url = urlparse.urlparse(dbstring)
        self.database = url.path[1:]
        self.username = url.username
        self.passwd = url.password
        self.host = url.hostname
        self.port = url.port

    def connect_database(self): 
        connection = psycopg2.connect(database=self.database, user=self.username,\
            password=self.passwd, host=self.host, port=self.port)
        print "Opened database successfully"
        return connection
        
    def disconnect_database(self,connection):   
        connection.close(); 
        print "Closed database successfully"

def __makeunicode(input_string):
    if input_string is None:
        return ''
    elif type(input_string) != unicode:
        return input_string.decode('utf-8')
    else:
        return input_string

def readReviewData(review_id, dbstring, with_abstracts=None):
    connector = RayyanDBConnector(dbstring)
    conn = connector.connect_database()
    cursor = conn.cursor()

    select_abstracts = ", string_agg(distinct abstracts.content,' ') as abstracts" if with_abstracts else ""
    join_abstracts = "LEFT JOIN abstracts ON abstracts.article_id = articles.id" if with_abstracts else ""

    query = """SELECT DISTINCT
        articles.id as article_id,
        articles.title as article_title,
        max(journals.title) as journal_title,
        extract('year' from articles.jcreated_at) as pub_year1,
        extract('year' from articles.article_date) as pub_year2,
        extract('year' from articles.screated_at) as pub_year3,
        string_agg(distinct concat_ws(' ', authors.firstname, authors.middlename, authors.lastname), ';') as authors
        %s
        FROM articles
        INNER JOIN articles_searches ON articles.id = articles_searches.article_id
        INNER JOIN searches ON articles_searches.search_id = searches.id
        LEFT JOIN journals ON articles.journal_id = journals.id
        %s
        LEFT JOIN articles_authors ON articles.id = articles_authors.article_id
        LEFT JOIN authors ON articles_authors.author_id = authors.id
        WHERE searches.review_id = %d AND searches.marked_as_deleted IS NULL
        GROUP BY articles.id""" %(select_abstracts, join_abstracts, review_id)

    cursor.execute(query)
    data_values = cursor.fetchall() 

    # TODO treat year is integer
    data = {}
    # for i, row in enumerate(data_values):
    for row in data_values:
        article_id = int(row[0])
        year = row[3] or row[4] or row[5]
        year = str(int(year)) if year else None
        data[article_id] = {
            "article_id": article_id,
            "title": preProcess(__makeunicode(row[1])),
            "journal": preProcess(__makeunicode(row[2])),
            "year": year,
            "authors": preProcess(";".join(sorted(__makeunicode(row[6]).split(";")))),
            "abstract": preProcess(__makeunicode(row[7])) if with_abstracts else None
        }
    
    # return all the articles
    connector.disconnect_database(conn)
    return data; 
