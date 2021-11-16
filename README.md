# Progress Report
So far the project has proven to be somewhat more difficult than expected. I have accomplished the following so far:
- Parse PDFs into a string
- Hook up API for arXiv
- Search for papers by author. 
- Basic UI to search and parse
Due to challenges in running my own server to get elsevier running due to CORS issues I have opted to do the same thing but using arXiv papers only. This is because they have a comprehensive system for APIs. However, their return objects are in XML which takes time to convert into JSONs. Now that I have both summaries for all papers that an author has written and the data for any given PDF, I will start looking at the performance differences between algorithms and choose a more optimal one. That should finalize the project and should be on good track after. 
## Challenges
The biggest challenge is getting the chrome extension to work the way I want it due to having service workers running weirdly. After a few hours of messing around and debugging I have achieved my goal of getting it to work properly.
## What's next
All that is left is implementing the actual algorithms and generating results. Since I already have the results, I need to compare the algorithms for relevance.

# CourseProject

## Team Members
Just me, royliu2!

## Topic
I have chosen to create a chrome extension that helps you parse research papers and find other papers that the authors have authored in order of relevance. This is related to ranking relevance of different data. The datasets that I will be using will be coming through API keys from `dev.elsevier.com`. We will query for data that the author has published and rank based on paper relevance. I plan on using native javascript to parse the data, and will demonstrate that it works by finding individuals with papers published in different fields. If the relevance is valid, then fields differing from the current paper will not be selected. This will likely take more than 20 hours for the follwing reasons:
 - Parse PDFs through JS (3 hours)
 - Hook up API properly (2 hours)
 - Find relevant information and using the valid algiorithms (10 hours)
 - Testing different tradeoffs (2 hours)
 - Debugging/Optimizations (5 hours)


 