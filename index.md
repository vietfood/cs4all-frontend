---
layout: distill
title: "Khoa học máy tính cho mọi người"
subtitle: "cs4all-vn"
# permalink: /main/
description: "Khoa học Máy tính không chỉ xoay quanh thuật toán — mà còn bao gồm rất nhiều lĩnh vực thú vị khác như Ngôn ngữ lập trình, Trình biên dịch, Đồ họa máy tính, Trí tuệ nhân tạo, và nhiều hơn nữa. Trang wiki này được xây dựng theo tinh thần của VNOI Wiki, với mục tiêu trở thành một thư viện mở cho mọi đối tượng: học sinh, sinh viên, người đi làm – bất kỳ ai quan tâm đến lĩnh vực này. Mình hy vọng đây sẽ là nơi giúp bạn tiếp cận các kiến thức một cách dễ dàng, từ đó nuôi dưỡng niềm yêu thích Khoa học Máy tính và góp phần xây dựng một cộng đồng CS mạnh tại Việt Nam."
date: 2025-02-04
htmlwidgets: true
hidden: false
giscus_comments: true

previous_section: false 
next_section: false

toc:
  - name: Giới thiệu
  - name: Hiện tại có gì trên cs4all-vn?
  - name: Lời mời gọi
---

{% include figure.liquid path="assets/img/oneforall.webp" class="img-fluid" %}

> Hình minh hoạ phía trên là One for All từ anime *My Hero Academia*. Mình xem việc chia sẻ kiến thức – viết một wiki mở – giống như tích luỹ sức mạnh và truyền lại cho những thế hệ sau. Và mình không muốn làm điều đó một mình. Mình hy vọng sẽ có nhiều người hơn cùng chung tay xây dựng một thư viện hay cộng đồng cho người Việt 📚.

## Giới thiệu

Chào mừng bạn đến với **cs4all-vn**! 👋  
Mình hiện tại là một dev quèn tại Hà Nội (và đã tốt nghiệp tại một trường IT tại Hồ Chí Minh). Dự án này là một nỗ lực cá nhân (hiện tại) nhằm hệ thống hoá, chia sẻ, và mở rộng kiến thức Khoa học Máy tính (CS).

Nhiều người nghĩ CS chỉ xoay quanh code và giải thuật – nhưng thật ra đó chỉ là bề nổi. CS là một thế giới rộng lớn: từ cách máy tính "học" như con người, cách tạo nên thế giới ảo qua hình ảnh và âm thanh.

Một vài ví dụ:

- **Machine Learning / Deep Learning**: Làm sao để máy tính học được từ dữ liệu?
- **Reinforcement Learning**: Làm sao để máy tính học được từ kinh nghiệm (thử và sai)?
- **Compilers & Programming Languages**: Làm sao máy hiểu được dòng code bạn viết?

Tại Việt Nam, mình nhận thấy phần lớn sự chú ý vẫn tập trung vào lập trình thi đấu và phát triển ứng dụng. Đây đều là những mảng cực kỳ quan trọng. Tuy nhiên, mình cũng tin rằng còn rất nhiều mảng nền tảng trong CS đang bị bỏ ngỏ — những mảng lý thuyết, học thuật, nghiên cứu mà không phải lúc nào cũng được tiếp cận dễ dàng, đặc biệt là bằng tiếng Việt.

Vì vậy, **cs4all-vn** ra đời với mong muốn trở thành một thư viện mở – nơi mọi người, từ học sinh đến người đã đi làm – đều có thể tìm hiểu về CS một cách bài bản và sâu sắc, bằng chính ngôn ngữ mẹ đẻ.

Mình không đặt mục tiêu thay thế bất kỳ nguồn nào như VNOI Wiki, mà muốn mở rộng phạm vi: từ các môn học cốt lõi như ML, RL hay các môn học *ít ai quan tâm* như Compiler, GPU Programming.

Mình tin rằng:  
> "Kiến thức là để sẻ chia – như One for All vậy."  
Và hy vọng nơi này sẽ là điểm gặp gỡ cho những ai thật sự muốn hiểu sâu về CS, cùng nhau xây dựng một cộng đồng tri thức mạnh ở Việt Nam. 💪


## Hiện tại có gì trên cs4all-vn?

Như đã nói, đây là một chặng đường dài. Để khởi động, mình đang tập trung "cày cuốc" và Việt hóa hai cuốn sách được xem là "Quỳ Hoa Bảo Điển" trong giới AI, nhưng lại khá khó nhằn cho người mới bắt đầu:

- [Pattern Recognition and Machine Learning (Bishop)](./prml): Mình đã hoàn thành các mục của chương I: Introduction. Mục tiêu là giải mã những công thức toán học khô khan thành lời văn dễ hiểu nhất.
- [Reinforcement Learning (Sutton & Barto)](./rl-sutton): Đã lên sóng được chương II: Multi-armed Bandit và chương III: Markov Decision Processes (chương quan trọng nhất).

Mình không chọn cách dịch "word-by-word" (từng từ một) vì nó rất sượng. Thay vào đó, mình cố gắng **diễn giải** lại dựa trên sự hiểu biết của bản thân, giữ nguyên các thuật ngữ tiếng Anh quan trọng (để các bạn dễ tra cứu sau này) nhưng giải thích tư duy cốt lõi bằng tiếng Việt.

## Lời mời gọi 

Cũng giống như Deku lúc mới nhận One for All, mình biết sức lực của mình hiện tại còn hạn chế và kiến thức cá nhân chắc chắn sẽ có nhiều sai sót.

Nếu bạn ghé qua và thấy một lỗi sai, một đoạn code chưa tối ưu, hay đơn giản là một câu văn lủng củng – xin đừng ngần ngại mở một **Issue** hoặc **Pull Request**. Hoặc tuyệt vời hơn, nếu bạn cũng đam mê những chủ đề "ngách" như Compiler hay GPU Programming và muốn chia sẻ, **cs4all-vn** luôn chào đón bạn trở thành một "holder" tiếp theo của ngọn đuốc này.

Hãy cùng nhau biến những kiến thức khó nhằn trở nên bình dân và dễ tiếp cận hơn. 🚀
