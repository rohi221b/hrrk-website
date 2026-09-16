# Treat Biziverse 305 as Inquiry success on the first slice

Biziverse will not create a second Lead for the same mobile (`305 Duplicate`). We still show the visitor the Home Inquiry success state for `-1` and `305` so retesting the pipe is not mistaken for a broken form. Other Biziverse codes and network failures show an error and keep the form. Follow-up Need text on a duplicate mobile is not stored (parked Q6).
