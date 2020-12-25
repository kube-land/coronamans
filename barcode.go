package main

import (
	//"fmt"
	"net/http"

	"github.com/julienschmidt/httprouter"

	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/code128"
	//"github.com/boombuler/barcode/pdf417"
	"image/png"
	//"os"
	"strconv"

	"image"
	"image/color"
	"image/draw"

	"golang.org/x/image/font"
	"golang.org/x/image/font/basicfont"
	"golang.org/x/image/math/fixed"
)

func GetBarcodeImage(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	image := ps.ByName("image")
	tokenize := regex.FindStringSubmatch(image)
	if len(tokenize) == 0 {

	}

	wStr := r.URL.Query().Get("w")
	if wStr == "" {
		wStr = "512"
	}
	width, err := strconv.Atoi(wStr)
	if err != nil {

	}

	hStr := r.URL.Query().Get("h")
	if hStr == "" {
		hStr = "224"
	}
	height, err := strconv.Atoi(hStr)
	if err != nil {

	}

	code, err := code128.Encode(tokenize[1])
	if err != nil {
		panic(err)
	}
	codeScale, err := barcode.Scale(code, width, height)

	img := subtitleBarcode(codeScale)

	w.Header().Set("Content-Type", "image/png")
	png.Encode(w, img)
}

func subtitleBarcode(bc barcode.Barcode) image.Image {
	fontFace := basicfont.Face7x13
	fontColor := color.RGBA{0, 0, 0, 255}
	margin := 5 // Space between barcode and text

	// Get the bounds of the string
	bounds, _ := font.BoundString(fontFace, bc.Content())

	widthTxt := int((bounds.Max.X - bounds.Min.X) / 64)
	heightTxt := int((bounds.Max.Y - bounds.Min.Y) / 64)

	// calc width and height
	width := widthTxt
	if bc.Bounds().Dx() > width {
		width = bc.Bounds().Dx()
	}
	height := heightTxt + bc.Bounds().Dy() + margin

	// create result img
	img := image.NewRGBA(image.Rect(0, 0, width, height))
	// draw the barcode
	draw.Draw(img, image.Rect(0, 0, bc.Bounds().Dx(), bc.Bounds().Dy()), bc, bc.Bounds().Min, draw.Over)

	// TextPt
	offsetY := bc.Bounds().Dy() + margin - int(bounds.Min.Y/64)
	offsetX := (width - widthTxt) / 2

	point := fixed.Point26_6{
		X: fixed.Int26_6(offsetX * 64),
		Y: fixed.Int26_6(offsetY * 64),
	}

	d := &font.Drawer{
		Dst:  img,
		Src:  image.NewUniform(fontColor),
		Face: fontFace,
		Dot:  point,
	}
	d.DrawString(bc.Content())
	return img
}
