import { useState, Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import Envelope from "./Envelope";
import PetalParticles from "./PetalParticles";
import SceneTransition from "./SceneTransition";

// ==========================================
// CẤU HÌNH MẬT KHẨU THƯ MẬT TẠI ĐÂY
// Bạn có thể đổi "1205" thành bất kỳ mật khẩu nào bạn muốn
// ==========================================
const SECRET_PASSWORD = "2706";

// ==========================================
// CẤU HÌNH THÔNG BÁO NTFY.SH (không cần database/backend)
// 1. Đổi NTFY_TOPIC thành một chuỗi BÍ MẬT, khó đoán (vd: "birthday-thiep-abc123xyz")
// 2. Cài app ntfy trên điện thoại: https://ntfy.sh
// 3. Subscribe đúng topic này trong app để nhận thông báo
// ==========================================
const NTFY_TOPIC = "thu-mat-sn2-k9r4m7p2xq8z";

const sendSecretLetterNotification = () => {
  const now = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Dùng JSON format để tránh lỗi emoji/UTF-8 trong HTTP headers
  fetch("https://ntfy.sh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: NTFY_TOPIC,
      title: "Thu Mat Da Duoc Mo! 💌",
      message: `Ai do vua mo buc thu mat cua ban luc ${now} 🎉`,
      priority: 4,
      tags: ["envelope", "heart"],
    }),
  })
    .then((res) => {
      console.log(
        "[ntfy] Status:",
        res.status,
        res.ok ? "✅ Gửi thành công!" : "❌ Lỗi server",
      );
    })
    .catch((err) => {
      console.error("[ntfy] Lỗi kết nối:", err);
    });
};

const sendWrongPasswordNotification = (attempt) => {
  const now = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  fetch("https://ntfy.sh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: NTFY_TOPIC,
      title: "Nhap sai mat khau! 🔐",
      message: `Ai do vua nhap sai: "${attempt}" luc ${now}`,
      priority: 3,
      tags: ["warning", "key"],
    }),
  })
    .then((res) =>
      console.log("[ntfy-wrong] Status:", res.status, res.ok ? "✅" : "❌"),
    )
    .catch((err) => console.error("[ntfy-wrong]", err));
};

const letterLines = [
  { text: "Chúc mừng sinh nhật em.", type: "greeting" },
  { text: "", type: "spacer" },
  { text: "Thật lạ khi nhận ra đã 6 tháng", type: "body" },
  { text: "kể từ lần cuối chúng ta nói chuyện.", type: "body" },
  { text: "Khoảng thời gian ấy đủ dài để nhiều thứ thay đổi,", type: "body" },
  { text: "nhưng cũng đủ ngắn để một vài kỷ niệm", type: "body" },
  { text: "vẫn còn nguyên vẹn trong tâm trí bạn.", type: "body" },
  { text: "", type: "spacer" },
  { text: "Bạn đã nghĩ rất lâu trước khi viết những dòng này.", type: "body" },
  {
    text: "Không phải vì không biết nói gì, mà vì có quá nhiều điều",
    type: "body",
  },
  { text: "muốn nói nhưng lại không biết nên bắt đầu từ đâu.", type: "body" },
  { text: "Cuối cùng, bạn nhận ra rằng hôm nay không cần nhắc", type: "body" },
  { text: "về những điều đã qua, cũng không cần tìm kiếm", type: "body" },
  { text: "một lời giải thích nào cả. Hôm nay chỉ đơn giản là", type: "body" },
  { text: "sinh nhật của một người từng rất đặc biệt.", type: "body" },
  { text: "", type: "spacer" },
  { text: "Bạn hy vọng em đang sống những ngày thật bình yên,", type: "body" },
  {
    text: "làm những điều mình yêu thích, gặp những người khiến",
    type: "body",
  },
  { text: "mình mỉm cười và được đối xử bằng tất cả sự tử tế", type: "body" },
  { text: "mà em xứng đáng nhận được.", type: "body" },
  { text: "", type: "spacer" },
  { text: "Dù hiện tại chúng ta không còn xuất hiện", type: "body" },
  { text: "trong cuộc sống của nhau như trước, bạn vẫn luôn", type: "body" },
  { text: "biết ơn vì những khoảnh khắc đã từng có.", type: "body" },
  { text: "Những kỷ niệm ấy đã trở thành một phần đẹp đẽ", type: "body" },
  { text: "trong hành trình trưởng thành của bạn.", type: "body" },
  { text: "", type: "spacer" },
  { text: "Tuổi mới rồi, chúc em thật nhiều sức khỏe,", type: "body" },
  { text: "thật nhiều niềm vui, và đủ dũng cảm để", type: "body" },
  { text: "theo đuổi những điều mình mong muốn.", type: "body" },
  { text: "Mong rằng mọi điều tốt đẹp nhất sẽ đến với em,", type: "body" },
  { text: "không chỉ trong ngày hôm nay mà còn", type: "body" },
  { text: "trong những ngày sau đó.", type: "body" },
  { text: "", type: "spacer" },
  { text: "Cảm ơn vì đã từng xuất hiện trong cuộc đời bạn.", type: "body" },
  { text: "Chúc mừng sinh nhật.", type: "body" },
  { text: "", type: "spacer" },
  { text: "— Một người vẫn luôn mong em hạnh phúc.", type: "closing" },
];

const secretLetterLines = [
  { text: "Có lẽ đây là lá thư cuối cùng bạn viết cho em.", type: "greeting" },
  { text: "", type: "spacer" },
  {
    text: "Không phải vì anh đã quên. Chỉ là đến một lúc nào đó, người ta phải học cách",
    type: "body",
  },
  { text: "sống cùng những điều không còn thuộc về mình nữa.", type: "body" },
  { text: "", type: "spacer" },
  {
    text: "Bạn từng nghĩ rằng yêu một người là phải giữ lấy họ. Sau này bạn mới hiểu,",
    type: "body",
  },
  {
    text: "có những tình cảm tồn tại lâu hơn cả sự hiện diện. Có những người dù đã rời xa,",
    type: "body",
  },
  { text: "vẫn ở lại trong một góc rất riêng của trái tim.", type: "body" },
  { text: "", type: "spacer" },
  {
    text: "6 tháng qua, bạn đã nhiều lần muốn nhắn cho em. Có những ngày nhìn thấy một điều quen thuộc,",
    type: "body",
  },
  {
    text: "nghe một bài hát cũ, đi ngang một con đường từng có kỷ niệm, bạn lại nghĩ đến em.",
    type: "body",
  },
  { text: "Nhưng rồi bạn không liên lạc.", type: "body" },
  { text: "", type: "spacer" },
  { text: "Không phải vì không nhớ.", type: "body" },
  { text: "", type: "spacer" },
  { text: "Mà bởi vì đôi khi chỉ nhớ nhung mà không liên lạc,", type: "body" },
  { text: "đó là cách cuối cùng bạn có thể yêu em.", type: "body" },
  { text: "", type: "spacer" },
  {
    text: "Bạn tôn trọng cuộc sống hiện tại của em, tôn trọng những lựa chọn của em,",
    type: "body",
  },
  {
    text: "và tôn trọng cả khoảng cách đang tồn tại giữa chúng ta.",
    type: "body",
  },
  { text: "", type: "spacer" },
  {
    text: "Bạn không biết sau này em có còn nhớ đến bạn hay không.",
    type: "body",
  },
  { text: "", type: "spacer" },
  {
    text: "Nếu sau này trong một khoảng khắc nào đó em nhớ đến bạn thì hãy đăng 1 story",
    type: "body",
  },
  {
    text: "nếu chữ cuối cùng là tên bạn thì nhất định bạn sẽ đến tìm em",
    type: "body",
  },
  { text: "", type: "spacer" },
  {
    text: "Còn nếu ngày đó không bao giờ đến, cũng không sao cả.",
    type: "body",
  },
  {
    text: "Ít nhất trong một quãng đời nào đó, bạn đã từng gặp được em.",
    type: "body",
  },
  { text: "", type: "spacer" },
  {
    text: "Bạn sẽ tiếp tục cuộc sống của mình, vẫn bước về phía trước như mọi người vẫn làm.",
    type: "body",
  },
  { text: "", type: "spacer" },
  {
    text: "Chỉ là ở một nơi nào đó trong tim, sẽ luôn có một góc nhỏ mang tên em.",
    type: "body",
  },
  { text: "", type: "spacer" },
  { text: "Và bạn nghĩ, như vậy là đủ rồi.", type: "closing" },
  { text: "", type: "spacer" },
  { text: "不要讨厌我, 那时候我也已经尽力了", type: "closing" },
];

export default function LetterScene({ onNext }) {
  const [letterState, setLetterState] = useState("envelope"); // 'envelope' | 'normalLetter' | 'passwordPrompt' | 'secretLetter'
  const [code, setCode] = useState(["", "", "", ""]);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Refs cho 4 ô nhập
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const handleSpace = (event) => {
      if (event.code !== "Space") return;
      if (letterState === "normalLetter") {
        event.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", handleSpace);
    return () => window.removeEventListener("keydown", handleSpace);
  }, [letterState, onNext]);

  // Tự động focus vào ô đầu tiên khi mở bảng nhập
  useEffect(() => {
    if (letterState === "passwordPrompt") {
      setTimeout(() => inputRefs[0].current?.focus(), 300);
    }
  }, [letterState]);

  const handleUnlock = (currentCode = code) => {
    const enteredPassword = currentCode.join("");
    if (enteredPassword === SECRET_PASSWORD) {
      setIsError(false);
      setLetterState("secretLetter");
      sendSecretLetterNotification(); // 📲 Gửi thông báo thành công
    } else {
      setIsError(true);
      setErrorMsg("Mật mã chưa đúng, hãy thử lại nhé... 🗝️");
      sendWrongPasswordNotification(enteredPassword); // 📲 Báo sai về điện thoại
      setCode(["", "", "", ""]);
      setTimeout(() => {
        setIsError(false);
        inputRefs[0].current?.focus(); // Focus lại ô đầu tiên sau khi reset
      }, 600);
    }
  };

  const handleInputChange = (index, value) => {
    // Chỉ nhận ký tự số
    const cleanValue = value.replace(/[^0-9]/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = cleanValue;
    setCode(newCode);

    // Nếu vừa nhập xong một số, tự động chuyển sang ô tiếp theo
    if (cleanValue && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Nếu đã nhập đủ 4 số, tự động mở khóa luôn
    if (newCode.every((num) => num !== "")) {
      handleUnlock(newCode);
    }
  };

  const handleInputKeyDown = (index, e) => {
    // Nếu bấm Backspace khi ô hiện tại đang trống, tự động lùi về ô trước
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
    }
  };

  return (
    <SceneTransition sceneKey="letter">
      {/* Parchment-toned background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 80%, rgba(239, 212, 223, 0.22) 0%, transparent 55%),
            radial-gradient(ellipse at 25% 25%, rgba(196, 181, 224, 0.18) 0%, transparent 45%),
            radial-gradient(ellipse at 75% 20%, rgba(200, 176, 139, 0.1) 0%, transparent 45%),
            #241f2e
          `,
        }}
      />

      {/* Petal canvas */}
      <div className="absolute inset-0 opacity-35">
        <Canvas
          camera={{ position: [0, 0, 7], fov: 60 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[3, 3, 5]} intensity={0.5} color="#ddccb1" />
          <Suspense fallback={null}>
            <PetalParticles />
          </Suspense>
        </Canvas>
      </div>

      {/* Scattered flower decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {["🌸", "🌺", "🌷", "🌹", "🌻", "💐", "🌼", "🌸", "🌺", "🌷"].map(
          (flower, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl sm:text-4xl"
              style={{
                bottom: `${-5 + (i % 4) * 4}%`,
                left: `${i * 10 + 1}%`,
                opacity: 0.28 + (i % 3) * 0.07,
                filter: "blur(1px)",
              }}
              initial={{ y: 50, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 0.28 + (i % 3) * 0.07,
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                delay: 0.5 + i * 0.1,
                duration: 1,
                rotate: { duration: 4 + i * 0.5, repeat: Infinity },
              }}
            >
              {flower}
            </motion.div>
          ),
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center w-full h-full px-4">
        <AnimatePresence mode="wait">
          {letterState === "envelope" && (
            /* ── Envelope view ── */
            <motion.div
              key="envelope-container"
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
            >
              <motion.h2
                className="text-3xl sm:text-4xl text-center"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#d9c3a5",
                }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                A Letter For You
              </motion.h2>

              <motion.div
                className="w-16 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #c8b08b, transparent)",
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              />

              <Envelope onOpen={() => setLetterState("normalLetter")} />
            </motion.div>
          )}

          {letterState === "normalLetter" && (
            /* ── Normal Letter View ── */
            <motion.div
              key="letter-normal"
              className="relative max-w-lg w-full"
              initial={{ scale: 0.3, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 180, damping: 24 }}
              style={{
                background: `
                  radial-gradient(ellipse at 30% 20%, rgba(255,250,235,0.07) 0%, transparent 60%),
                  rgba(38, 32, 50, 0.78)
                `,
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                border: "1px solid rgba(212, 168, 83, 0.28)",
                borderRadius: 20,
                padding: "2.4rem 2.8rem",
                boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
                maxHeight: "82vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Corner gold borders */}
              {[
                {
                  top: 0,
                  left: 0,
                  borderTop: "2px solid #c8b08b",
                  borderLeft: "2px solid #c8b08b",
                  borderRadius: "20px 0 0 0",
                },
                {
                  top: 0,
                  right: 0,
                  borderTop: "2px solid #c8b08b",
                  borderRight: "2px solid #c8b08b",
                  borderRadius: "0 20px 0 0",
                },
                {
                  bottom: 0,
                  left: 0,
                  borderBottom: "2px solid #c8b08b",
                  borderLeft: "2px solid #c8b08b",
                  borderRadius: "0 0 0 20px",
                },
                {
                  bottom: 0,
                  right: 0,
                  borderBottom: "2px solid #c8b08b",
                  borderRight: "2px solid #c8b08b",
                  borderRadius: "0 0 20px 0",
                },
              ].map((style, i) => (
                <div
                  key={i}
                  className="absolute w-12 h-12 opacity-40 pointer-events-none"
                  style={style}
                />
              ))}

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  borderRadius: 20,
                  background: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 28px,
                    rgba(200,176,139,0.035) 28px,
                    rgba(200,176,139,0.035) 29px
                  )`,
                }}
              />

              {/* Scrollable inner content */}
              <div className="overflow-y-auto no-scrollbar flex-1 relative pr-1">
                <div className="space-y-0.5 mb-8 relative">
                  {letterLines.map((line, i) => {
                    const isGreeting = line.type === "greeting";
                    const isClosing = line.type === "closing";
                    const isSpacer = line.type === "spacer";

                    return (
                      <motion.p
                        key={i}
                        className="handwriting"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.55 }}
                        style={{
                          fontSize: isSpacer
                            ? "0.4rem"
                            : isGreeting
                              ? "1.25rem"
                              : isClosing
                                ? "1.15rem"
                                : "1.1rem",
                          color: isGreeting
                            ? "#e8ccaa"
                            : isClosing
                              ? "#d9c3a5"
                              : "rgba(251,247,241,0.82)",
                          minHeight: isSpacer ? "0.9rem" : "auto",
                          fontStyle: "italic",
                          lineHeight: 1.75,
                        }}
                      >
                        {line.text || "\u00A0"}
                      </motion.p>
                    );
                  })}
                </div>

                {/* Poetic reminder text */}
                <motion.p
                  className="handwriting text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.85, y: 0 }}
                  transition={{
                    delay: letterLines.length * 0.08 + 0.3,
                    duration: 0.6,
                  }}
                  style={{
                    color: "#ffdfa0",
                    fontSize: "1.05rem",
                    fontStyle: "italic",
                    marginBottom: "1.2rem",
                    lineHeight: 1.5,
                    textShadow: "0 0 8px rgba(212, 168, 83, 0.15)",
                  }}
                ></motion.p>

                {/* Action Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row items-center justify-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: letterLines.length * 0.08 + 0.5 }}
                >
                  {/* Secret letter button */}
                  <motion.button
                    onClick={() => setLetterState("passwordPrompt")}
                    className="cursor-pointer font-semibold"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 15px rgba(212,168,83,0.3)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(212, 168, 83, 0.25), rgba(180, 130, 40, 0.25))",
                      border: "1px solid rgba(212, 168, 83, 0.6)",
                      borderRadius: 12,
                      padding: "0.6rem 1.6rem",
                      color: "#ffdfa0",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.8rem",
                      letterSpacing: "0.04em",
                    }}
                  >
                    🔒
                  </motion.button>

                  {/* Continue button */}
                  <motion.button
                    onClick={onNext}
                    className="cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: "rgba(200,176,139,0.08)",
                      border: "1px solid rgba(200,176,139,0.3)",
                      borderRadius: 12,
                      padding: "0.6rem 1.6rem",
                      color: "rgba(251,247,241,0.6)",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.8rem",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Tiếp tục ✦
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {letterState === "passwordPrompt" && (
            /* ── Password Prompt View ── */
            <motion.div
              key="password-prompt"
              className="relative max-w-sm w-full"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={
                isError
                  ? {
                      x: [0, -10, 10, -10, 10, 0],
                      transition: { duration: 0.45 },
                    }
                  : { scale: 1, opacity: 1, y: 0 }
              }
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: "rgba(38, 32, 50, 0.85)",
                backdropFilter: "blur(28px)",
                border: "1px solid rgba(212, 168, 83, 0.35)",
                borderRadius: 24,
                padding: "2rem 2.2rem",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Pulsing Lock Icon */}
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  fontSize: "2.5rem",
                  filter: "drop-shadow(0 0 10px rgba(212,168,83,0.5))",
                }}
              >
                🔐
              </motion.div>

              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#ffdfa0",
                  fontSize: "1.2rem",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                Nhập mật mã để mở
              </h3>

              {/* 4 Password inputs */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  width: "100%",
                  margin: "8px 0",
                }}
              >
                {code.map((num, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={num}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    onKeyDown={(e) => handleInputKeyDown(idx, e)}
                    style={{
                      width: "48px",
                      height: "52px",
                      background: "rgba(255, 250, 230, 0.04)",
                      border: isError
                        ? "2.5px solid #ff4d4d"
                        : num
                          ? "2px solid rgba(212, 168, 83, 0.8)"
                          : "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "1.4rem",
                      fontWeight: "700",
                      outline: "none",
                      textAlign: "center",
                      caretColor: "#ffdfa0",
                      transition: "all 0.2s ease",
                      boxShadow: num
                        ? "0 0 12px rgba(212, 168, 83, 0.25)"
                        : "none",
                    }}
                  />
                ))}
              </div>

              {isError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    color: "#ff6666",
                    fontSize: "0.75rem",
                    margin: 0,
                    textAlign: "center",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {errorMsg}
                </motion.p>
              )}

              <div className="flex flex-col w-full gap-2 mt-2">
                <motion.button
                  onClick={handleUnlock}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: "linear-gradient(135deg, #d4a853, #b8913a)",
                    border: "none",
                    borderRadius: 12,
                    padding: "0.65rem",
                    color: "#241f2e",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                  }}
                >
                  Mở 🗝️
                </motion.button>

                <button
                  onClick={() => {
                    setIsError(false);
                    setCode(["", "", "", ""]);
                    setLetterState("normalLetter");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(251, 247, 241, 0.4)",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                    alignSelf: "center",
                    padding: "4px 8px",
                  }}
                >
                  Quay lại
                </button>
              </div>
            </motion.div>
          )}

          {letterState === "secretLetter" && (
            /* ── Secret Letter View ── */
            <motion.div
              key="letter-secret"
              className="relative max-w-lg w-full"
              initial={{ scale: 0.3, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 24 }}
              style={{
                /* Magical warm rose gold paper feel */
                background: `
                  radial-gradient(ellipse at 30% 20%, rgba(255,220,180,0.12) 0%, transparent 60%),
                  rgba(46, 32, 40, 0.88)
                `,
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                border: "1px solid rgba(255, 180, 100, 0.35)",
                borderRadius: 20,
                padding: "2.4rem 2.8rem",
                boxShadow: `
                  0 0 35px rgba(255, 180, 100, 0.15),
                  0 24px 64px rgba(0,0,0,0.6)
                `,
                maxHeight: "82vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Sparkle overlay decoration */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    style={{
                      position: "absolute",
                      top: `${Math.random() * 90}%`,
                      left: `${Math.random() * 90}%`,
                      fontSize: "0.8rem",
                      opacity: 0.2,
                    }}
                    animate={{
                      opacity: [0.1, 0.4, 0.1],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{ duration: 2 + i, repeat: Infinity }}
                  >
                    ✨
                  </motion.div>
                ))}
              </div>

              {/* Gold borders */}
              {[
                {
                  top: 0,
                  left: 0,
                  borderTop: "2px solid #ffb86c",
                  borderLeft: "2px solid #ffb86c",
                  borderRadius: "20px 0 0 0",
                },
                {
                  top: 0,
                  right: 0,
                  borderTop: "2px solid #ffb86c",
                  borderRight: "2px solid #ffb86c",
                  borderRadius: "0 20px 0 0",
                },
                {
                  bottom: 0,
                  left: 0,
                  borderBottom: "2px solid #ffb86c",
                  borderLeft: "2px solid #ffb86c",
                  borderRadius: "0 0 0 20px",
                },
                {
                  bottom: 0,
                  right: 0,
                  borderBottom: "2px solid #ffb86c",
                  borderRight: "2px solid #ffb86c",
                  borderRadius: "0 0 20px 0",
                },
              ].map((style, i) => (
                <div
                  key={i}
                  className="absolute w-12 h-12 opacity-50 pointer-events-none"
                  style={style}
                />
              ))}

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  borderRadius: 20,
                  background: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 28px,
                    rgba(255,200,150,0.038) 28px,
                    rgba(255,200,150,0.038) 29px
                  )`,
                }}
              />

              {/* Quill icon representing typing secret */}
              <div className="absolute top-4 right-6 text-xl opacity-30 pointer-events-none">
                ✒️
              </div>

              {/* Scrollable inner content */}
              <div className="overflow-y-auto no-scrollbar flex-1 relative pr-1">
                <div className="space-y-0.5 mb-8 relative">
                  {secretLetterLines.map((line, i) => {
                    const isGreeting = line.type === "greeting";
                    const isClosing = line.type === "closing";
                    const isSpacer = line.type === "spacer";

                    return (
                      <motion.p
                        key={i}
                        className="handwriting"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.55 }}
                        style={{
                          fontSize: isSpacer
                            ? "0.4rem"
                            : isGreeting
                              ? "1.25rem"
                              : isClosing
                                ? "1.15rem"
                                : "1.1rem",
                          color: isGreeting
                            ? "#ffcf9c"
                            : isClosing
                              ? "#f9d2a5"
                              : "rgba(255,243,230,0.85)",
                          minHeight: isSpacer ? "0.9rem" : "auto",
                          fontStyle: "italic",
                          lineHeight: 1.75,
                        }}
                      >
                        {line.text || "\u00A0"}
                      </motion.p>
                    );
                  })}
                </div>

                {/* Continue button */}
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: secretLetterLines.length * 0.08 + 0.6 }}
                >
                  <motion.button
                    onClick={onNext}
                    className="cursor-pointer border-none"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: "rgba(255,180,100,0.12)",
                      border: "1px solid rgba(255,180,100,0.3)",
                      borderRadius: 10,
                      padding: "0.55rem 1.6rem",
                      color: "#ffcf9c",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                    }}
                  >
                    Tiếp tục ✦
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneTransition>
  );
}
