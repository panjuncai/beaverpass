import { useRouter } from 'next/navigation'
import { RefObject } from 'react'

interface MessageModalProps {
  title: string
  content: string
  dialogRef: RefObject<HTMLDialogElement>
  redirectUrl?: string
}

export default function MessageModal({ title, content, dialogRef,redirectUrl }: MessageModalProps) {
  const router = useRouter()

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box">
        <h2 className="font-bold text-lg">{title}</h2>
        <p className="py-4">{content}</p>
        <div className="modal-action">
          <form method="dialog">
            <button 
              className="btn btn-ghost mr-2" 
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                dialogRef.current?.close()
                if (redirectUrl) {
                  void router.push(redirectUrl)
                }
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
} 