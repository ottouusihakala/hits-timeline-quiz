import cv2

im = cv2.imread("hitster-qrcode.png")
det = cv2.QRCodeDetector()

retval, points, straight_qrcode = det.detectAndDecode(im)
print("retval", retval)
print("points", points)
print("straight_qrcode", straight_qrcode)