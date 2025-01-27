import { motion } from "framer-motion";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import "./cardQuillStyle.css";

export default function FlashCard({
  card,
  isCurrent,
  isNext,
  isHidden,
  flipped,
  onFlip,
}) {
  const handleClick = () => {
    if (isCurrent) {
      onFlip();
    }
  };

  return (
    <motion.div
      className={`absolute w-[90vw] sm:w-[80vw] md:w-[60vw] lg:w-[50vw] h-[50vh] sm:h-[50vh] md:h-[50vh] lg:h-[45vh] bg-transparent shadow-lg rounded-xl cursor-pointer flex justify-center items-center text-center transition-all duration-500 ease-in-out ${
        isHidden ? "hidden" : ""
      } ${isNext || !isCurrent ? "blur-sm opacity-50" : ""}`} // Agrega blur a las cartas que no son centrales
      style={{
        transform: isCurrent
          ? "translateX(0)"
          : isNext
          ? "translateX(15vw) scale(0.9)" // Tarjeta a la derecha
          : "translateX(-15vw) scale(0.8)", // Tarjeta a la izquierda
        zIndex: isCurrent ? 10 : 5,
      }}
      onClick={handleClick}
    >
      <motion.div
        className="w-full h-full flex justify-center items-center"
        animate={{ rotateY: flipped && isCurrent ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ perspective: "1000px" }}
      >
        {/* Tarjeta frontal */}
        <motion.div
          className={`absolute w-full h-full flex justify-center items-center rounded-xl bg-blue-200 text-black p-2 sm:p-4 ${
            flipped ? "rotate-y-180 shadow-none" : ""
          }`}
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <span
            className="text-sm sm:text-lg"
            style={flipped ? { transform: "rotateY(-180deg)" } : {}}
          >
            {flipped && isCurrent ? (
              <ReactQuill
                value={card.answer}
                readOnly={true}
                modules={{ toolbar: false }}
                theme="bubble"
                className="text-xs sm:text-sm text-muted-foreground"
              />
            ) : (
              <ReactQuill
                value={card.question}
                readOnly={true}
                modules={{ toolbar: false }}
                theme="bubble"
                className="text-xs sm:text-sm text-muted-foreground"
              />
            )}
          </span>
        </motion.div>

        {/* Tarjeta trasera */}
        <motion.div
          className={`absolute w-full h-full flex justify-center items-center rounded-xl bg-green-200 text-black p-2 sm:p-4 ${
            flipped ? "" : "rotate-y-180"
          }`}
          style={{
            backfaceVisibility: "hidden",
            rotateY: 180,
          }}
        >
          <span className="text-sm sm:text-lg">
            {flipped && isCurrent ? (
              <ReactQuill
                value={card.answer}
                readOnly={true}
                modules={{ toolbar: false }}
                theme="bubble"
                className="text-xs sm:text-sm text-muted-foreground"
              />
            ) : (
              ""
            )}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
