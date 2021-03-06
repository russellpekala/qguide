# Scraping and Processing the Harvard Q Guide, April 2018
Information and scripts to facilitate hacking/analyzing of the Harvard Q Guide.  This repository has all code necessary to scrape and start processing/visualizing data from the Harvard Q Guide.  PR's welcome if other people want to mine areas of the dataset I didn't check out.

### Data-Scraping
* For detailed instructions on how you, too, can scrape the Harvard Q Guide, please see my Medium post about the process.
* The only file in this repository relevant to scraping is `sitemap.json`.  Note that this file only scrapes data for a single semester's responses.  It is currently set to extract data for fall 2011, but can be easily set to any other semester by replacing one or two things.  
### Data-Cleaning
* Put all the csv's acquired from step one into a folder and run the notebook `clean_data.ipynb` straight through in order to produce a single file `final.csv`
* Since the raw data behind the Q Guide is only available to Harvard students, I am not making the final data public.  That said, if you are a Harvard student and want access to the data, please send me an email and I can send you the cleaned and scraped data to your college email address.

### Data-Wrangling
* The data processing file is `data_wrangling.ipynb`.  It is commented so that hopefully people can figure it out and add to the analyses that exist there.

### Data-Visualizing
* Interactive data visualizations can be found at this project's hosted [website](https://russellpekala.github.io/qguide/).  
* Code for these visualizations is in the `js/` folder.  The `.json` and `.csv` files that the visualizations feed on files are produced in the `data_wrangling.ipynb` file.  

## Awknowledgements
* [Sara Valente](http://ssvalente.com) had the ingenuity to use Web Scraper for this project, and wrote the sitemap.json that got us past Two-Factor Authentication.  She co-authored the data scraping part of this project.
* Thanks to the team behind [Web Scraper](http://webscraper.io). Yes, it's a bit cluncky, but it did what nothing else could do and is completely free.  Cheers to that! 
* I am not, by any stretch, the first student interested in this data.  It's worth checking out previous Q Guide data projects by [Roger Zou](https://mystudentvoices.com/analyzing-the-harvard-q-guide-1ba02948819) and [Ryan Kerr](https://github.com/ryandkerr/q-guide). They were inspiring and well-motivated.  I also here [Patrick Pan](https://github.com/patrickhpan/scrape-q-guide) has been doing something recently that is probably way cleaner than this method.  

## Selfish Motivations
* Please check out an ongoing project I have that aims to do more than this one could.  