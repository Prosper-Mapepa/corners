"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Africaa from "@/assets/africaa.png"

type AppComingSoonModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AppComingSoonModal({ open, onOpenChange }: AppComingSoonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden border-orange-200/80 bg-white p-0 shadow-xl ring-1 ring-orange-500/15 sm:max-w-[400px]">
        <div
          className="h-1.5 w-full shrink-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600"
          aria-hidden
        />
        <div className="px-8 pb-8 pt-9 text-center sm:px-10 sm:pt-10">
          <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 ring-1 ring-orange-200/80 shadow-sm shadow-orange-500/10 sm:h-[4.5rem] sm:w-[4.5rem]">
            <Image src={Africaa} alt="" width={44} height={44} className="h-11 w-11 sm:h-12 sm:w-12" />
          </div>

          <DialogTitle className="flex flex-col items-center gap-2 text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-gray-700 sm:text-xl">
              Mobile app
            </span>
            <span className="text-[1.85rem] font-extrabold leading-[1.05] tracking-tight text-balance sm:text-4xl sm:leading-[1.05] md:text-[2.75rem]">
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Coming soon
              </span>
            </span>
          </DialogTitle>
          <DialogDescription className="mt-5 max-w-[28ch] mx-auto text-base leading-relaxed text-gray-600 sm:text-[17px] sm:max-w-none">
            A great experience is on the way — crafted to bring Africa&apos;s best spots to your pocket. 
          </DialogDescription>

          <div className="mt-8 flex flex-col gap-2">
            <DialogClose asChild>
              <Button
                asChild
                className="h-11 w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-[15px] font-semibold text-white shadow-md shadow-orange-500/20 hover:from-amber-600 hover:via-orange-600 hover:to-red-700"
              >
                <Link href="/discover">Continue on the web</Link>
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full rounded-xl text-orange-900/70 hover:bg-orange-50 hover:text-orange-950"
              >
                Maybe later
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
