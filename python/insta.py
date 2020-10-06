from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver import ActionChains
import time
import random
from sys import argv
from sys import platform
import requests
import json
from selenium.webdriver.support import expected_conditions as EC
#argv[1] - логин, argv[2] - пароль , argv[3] - кол-во файлов, argv[4] - путь к этим файлам, argv[5] - id поста, argv[6] - hasura_url, argv[7] - hasura_pass
#получаем данные из базы
query = "{ posts(where: {id: { _eq: \"" + argv[5] + "\"} }) { texts } }"
# data to be sent to api 
data = {'query':query} 
headers = {'x-hasura-admin-secret': argv[7]}
# sending post request and saving response as response object 
r = requests.post(url = argv[6], data = json.dumps(data), headers=headers)
text = json.loads(r.text)['data']['posts'][0]['texts'][0]['text']
#инициализируем браузер
added = ""
if platform == "win32":
    driver = webdriver.Firefox(executable_path='./geckodriver.exe')
    added = "D:"
    argv[4] = argv[4].replace("/","\\")
else: 
    driver = webdriver.Firefox(executable_path='./geckodriver')
    
driver.implicitly_wait(10)
#заходим на студию
driver.get("https://business.facebook.com/creatorstudio")
driver.find_element_by_css_selector("div[data-tooltip-display='overflow']").click()
time.sleep(random.randint(1, 4))
#авторизация
driver.find_element_by_id('email').send_keys(argv[1])
driver.find_element_by_id('pass').send_keys(argv[2])
driver.find_element_by_id("loginbutton").click()
time.sleep(random.randint(1, 4))
#кликаем по инсте
driver.find_element_by_id("media_manager_chrome_bar_instagram_icon").click()
time.sleep(random.randint(1, 4))
#начинаем создание публикации
driver.find_element_by_css_selector("div[data-hover='tooltip'][data-tooltip-display='overflow']").click()
driver.find_element_by_css_selector("div[role='menuitem']").click()
time.sleep(random.randint(1, 4))
#Написание текста
driver.find_element_by_css_selector("div[data-contents='true']").click()
builder = ActionChains(driver)
builder.send_keys(text).perform()
time.sleep(1)
#загрузка файла, несколько файлов через \n
upload_img = ""
for number in range(0, int(argv[3])):
    upload_img += added + argv[4] + "file" + str(number) + ".jpg\n"
upload_img = upload_img[:-1]
print(upload_img)
driver.find_element_by_css_selector("div[aria-haspopup='true'] > div > span").click()
driver.find_element_by_css_selector("input[type='file']").send_keys(upload_img)
time.sleep(2)
driver.find_element_by_css_selector("button[aria-checked='false'][aria-disabled='false'][aria-label='checkbox']").click()
time.sleep(1)
#Нажать на кнопку опубликовать
elems = driver.find_elements_by_css_selector("button > div > div[data-hover='tooltip']")
elems[2].click()
myDynamicElement = driver.find_element_by_class_name("_6x5f")
time.sleep(2)
#закрываем браузер
driver.close()
print("ok")