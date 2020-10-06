import os
from sys import argv
upload_img = ""
for number in range(0, int(argv[3])):
    upload_img += argv[4] + "file" + str(number) + ".jpg\n"
upload_img = upload_img[:-1]
print(upload_img)

print(os.getpid())