export default function Modal({ open, onClose, children }) {
  return (
    <div
      onClick={onClose}
      className={`
        fixed inset-0 flex justify-center items-center transition-all duration-200 z-50
        ${open ? 'visible bg-black/60 backdrop-blur-sm' : 'invisible'}
      `}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          transition-all duration-200
          ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
      >
        {/* <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-lg text-gray-400 bg-white hover:bg-gray-50 hover:text-gray-600"
          as
        ></button> */}
        {children}
      </div>
    </div>
  )
}
