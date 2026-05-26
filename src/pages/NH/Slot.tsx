import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from "sweetalert2";

import Header from "../../components/Header";
import ModalConfirmLogout from "../../components/ModalConfirmLogout";
import "./HomeNH.css";
import "./SlotGame.css";
import ProgressBar from '../NH/components/ProgressBar';
import { mockApi } from "../../services/mockApi";

interface TableItem {
  time: string;
  percent: number;
  typeGame: string;
  name: string;
  showIcon?: string;
  _id: string;
}

// FE mockApi items (PG): order + showIcon are the source of truth for FE.
const PG_FE_MOCK_ITEMS = [
  { name: "Cuộc Đối Đầu Tiền Thưởng Hoang Dã", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0113.png" },
  { name: "Đường Mạt Chược 2", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0055.png" },
  { name: "Đường Mạt Chược 1", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0046.png" },
  { name: "Kho Báu AZTEC", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0066.png" },
  { name: "Neko may mắn", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0073.png" },
  { name: "Thỏ May Mắn", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0120.png" },
  { name: "Kỳ Lân Mách Nước", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0084.png" },
  { name: "Ban nhạc hoang dã", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0083.png" },
  { name: "Đêm tiệc cocktail", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0098.png" },
  { name: "Chiến Thắng Thần Tài", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0052.png" },
  { name: "thần may mắn ganesha", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0057.png" },
  { name: "Rồng May Mắn", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0140.png" },
  { name: "pháo hoa hoang dã", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0063.png" },
  { name: "Nữ hoàng tiền thưởng", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0071.png" },
  { name: "Truyền thuyết về Perseus", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0111.png" },
  { name: "Khỉ Hoang Dã#3258", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0143.png" },
  { name: "khủng hoảng zombie", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0148.png" },
  { name: "Asgardian trỗi dậy", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0118.png" },
  { name: "Sự Báo Thù Của Geisha", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/VI/PG0158.png" },
  { name: "Anubis", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0146.png" },
  { name: "Cơn cuồng tiền mặt", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0142.png" },
  { name: "Danh dự Yakuza", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/VI/PG0151.png" },
  { name: "Tiền thưởng cá mập", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0150.png" },
  { name: "Truyền thuyết Người sói", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0138.png" },
  { name: "yêu tinh giàu có", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0041.png" },
  { name: "Cơn sốt bữa tiệc cuồng nhiệt", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0121.png" },
  { name: "Giấc mơ Ma Cao", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0060.png" },
  { name: "Kho Báu Của Thuyền Trưởng", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0039.png" },
  { name: "Nhà Vô Địch Tốc Độ", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0110.png" },
  { name: "Chim cánh cụt", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0037.png" },
  { name: "Đôi cánh của Iguazu", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0152.png" },
  { name: "Tài sản của Midas", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0119.png" },
  { name: "Pinata Wins", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0144.png" },
  { name: "Tiền Thưởng Grimms: Hansel & Gretel", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0170.png" },
  { name: "Thợ Mỏ Ngân Hà", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0169.png" },
  { name: "Cuộc Truy Tìm Kho Báu Rồng", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0168.png" },
  { name: "Cơn Sốt Quán Ăn Vòng Quay", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0167.png" },
  { name: "Jack Thợ Săn Người Khổng Lồ", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0166.png" },
  { name: "Kho báu của người chết", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0165.png" },
  { name: "Cú Đấm Giàu Sang", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/VI/PG0164.png" },
  { name: "Cơn Cuồng Nộ Tận Thế", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/VI/PG0163.png" },
  { name: "Cuộc Đua Graffiti", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/VI/PG0163.png" },
  { name: "Vận May Của Ngài Kho Báu", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/VI/PG0161.png" },
  { name: "Kỳ quan Inca", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/VI/PG0160.png" },
  { name: "Rắn May Mắn", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/VI/PG0159.png" },
  { name: "Sô-cô-la Cao Cấp", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/VI/PG0157.png" },
  { name: "Lễ hội Rio", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/VI/PG0156.png" },
  { name: "Kỳ Quan Viện Bảo Tàng", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0155.png" },
  { name: "Niềm vui ẩm thực Oishi", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/VI/PG0154.png" },
  { name: "Ba chú heo điên", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0153.png" },
  { name: "Bóng đá nóng bỏng", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0149.png" },
  { name: "Chicky Chạy", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0147.png" },
  { name: "Phép thuật huyền bí", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0145.png" },
  { name: "Đá quý vàng", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0141.png" },
  { name: "Rồng Lửa 2", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0139.png" },
  { name: "Báu vật của Tsar (Báu vật của Tsar)", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0137.png" },
  { name: "Băng Nhóm Mafia", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0136.png" },
  { name: "Lò Vàng (Lò Vàng)", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0135.png" },
  { name: "Rút tiền trong vụ cướp hoang dã", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0134.png" },
  { name: "Tiền đạo tối thượng", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/VI/PG0133.png" },
  { name: "Cuồng nhiệt Hải Tặc Ninja", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0132.png" },
  { name: "VinhquangcủaNgườiđấusĩ", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0131.png" },
  { name: "Safari Hoang Dã", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0130.png" },
  { name: "Du thuyền Hoàng gia", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0129.png" },
  { name: "Kẹo Trái Cây", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0128.png" },
  { name: "Cỏ Ba Lá May Mắn Giàu Có", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/VI/PG0127.png" },
  { name: "Siêu Golf Drive", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0126.png" },
  { name: "Linh hồn huyền bí", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0125.png" },
  { name: "Lễ té nước Songkran", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0124.png" },
  { name: "Tiệm bánh Bonanza", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0123.png" },
  { name: "tiki hawaii", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0122.png" },
  { name: "Bữa Tối Hân Hoan", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0117.png" },
  { name: "Vàng giả kim", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0116.png" },
  { name: "Kỳ quan vật tổ", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0115.png" },
  { name: "Cây Tài Lộc Thịnh Vượng", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0114.png" },
  { name: "Wild Coaster", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0112.png" },
  { name: "Heo đất may mắn", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0109.png" },
  { name: "Win Win Fish Prawn Crab", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0108.png" },
  { name: "Battleground Royale", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0107.png" },
  { name: "Bữa tiệc của Nữ hoàng", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0106.png" },
  { name: "Rooster Rumble", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0105.png" },
  { name: "Hoa bướm", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0104.png" },
  { name: "Destiny of Sun & Moon", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0103.png" },
  { name: "Đá quý Garuda", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0102.png" },
  { name: "Hổ vận may", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0101.png" },
  { name: "Sự thịnh vượng phương Đông", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0100.png" },
  { name: "Lễ hội hóa trang", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0099.png" },
  { name: "Biểu tượng cảm xúc phong phú", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0097.png" },
  { name: "Kỳ quan vùng đất linh hồn", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0095.png" },
  { name: "Vua khỉ huyền thoại", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0094.png" },
  { name: "Buffalo Win", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0093.png" },
  { name: "Siêu thị Spree", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0092.png" },
  { name: "Raider Jane's Crypt of Fortune", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0091.png" },
  { name: "Mermaid Riches", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0089.png" },
  { name: "Vương quốc kỷ Jura", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0088.png" },
  { name: "Sự trỗi dậy của Apollo", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0086.png" },
  { name: "Heist of Stakes", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0085.png" },
  { name: "Kẹo Bonanza", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0082.png" },
  { name: "Kho báu hùng vĩ", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0081.png" },
  { name: "Vàng tiền điện tử", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0080.png" },
  { name: "Kỳ nghỉ Bali", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0079.png" },
  { name: "Vận may tuổi Sửu", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0078.png" },
  { name: "Vương triều Opera", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0077.png" },
  { name: "Người bảo vệ băng và lửa", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0076.png" },
  { name: "Đá quý thiên hà", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0075.png" },
  { name: "Jack Sương Giá Mùa Đông", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0074.png" },
  { name: "Trang sức của sự thịnh vượng", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0072.png" },
  { name: "Sự quyến rũ của ma cà rồng", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0070.png" },
  { name: "Bí Mật Của Cleopatra", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0069.png" },
  { name: "Kỳ quan sông Thái", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0068.png" },
  { name: "Circus Delight", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0067.png" },
  { name: "Đèn Aladdin", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0065.png" },
  { name: "Phượng Hoàng Nổi Dậy", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0059.png" },
  { name: "Cuốn sách bí ẩn của Ai Cập", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0056.png" },
  { name: "Thiên Đường Bikini", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0054.png" },
  { name: "nổ kẹo", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0053.png" },
  { name: "Vị Cứu Tinh - Hành Trình", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0051.png" },
  { name: "Bóng Đá Thiếu Lâm", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0050.png" },
  { name: "Guồng Quay Tình Yêu", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0049.png" },
  { name: "chuột may mắn", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0048.png" },
  { name: "Long Sinh", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0047.png" },
  { name: "Rồng Hổ May Mắn", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0045.png" },
  { name: "Nhà Vô Địch Muay Thái", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0044.png" },
  { name: "Ninja đối đầu Samurai", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0043.png" },
  { name: "Bá Hổ Thu Hương", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0042.png" },
  { name: "Cuộc Phiêu Lưu Đến Kho Báu", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0038.png" },
  { name: "Kho Báu Khổng Lồ", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0035.png" },
  { name: "Khu Rừng Vui Nhộn", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0033.png" },
  { name: "Ganesha Vàng", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0031.png" },
  { name: "Ân Sủng Của Hoàng Đế", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0030.png" },
  { name: "Biểu Tượng Ai Cập", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0029.png" },
  { name: "Heo Vàng", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0028.png" },
  { name: "Vị Cứu Tinh - Thanh Kiếm", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0027.png" },
  { name: "Quà Của Ông Già Noel", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0025.png" },
  { name: "Gấu Trúc Hip Hop", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0024.png" },
  { name: "Sư Tử Vương Giả", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0023.png" },
  { name: "Huyền thoại Hou Yi", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0021.png" },
  { name: "Ông Hallow-Win!", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0020.png" },
  { name: "Truyền Thuyết Rồng", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0019.png" },
  { name: "Cô Bé Quàng Khăn Đỏ", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0017.png" },
  { name: "Vị Cứu Tinh", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0014.png" },
  { name: "Plushie Frenzy", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0012.png" },
  { name: "Medusa 1: Lời nguyền của Athena", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0009.png" },
  { name: "Cây Tài Lộc", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0007.png" },
  { name: "Medusa 2: Sứ mệnh Perseus", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0005.png" },
  { name: "Win Win Won", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0004.png" },
  { name: "Thần May Mắn", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0003.png" },
  { name: "Mỹ Nhân Kế Của Diao Chan", showIcon: "https://images.484930494.com/TCG_GAME_ICONS/PG/EN/PG0002.png" }
] as const;

const PG_NAME_ORDER = PG_FE_MOCK_ITEMS.map((x) => x.name);
const PG_SHOWICON_BY_NAME = (() => {
  const m = new Map<string, string>();
  for (const it of PG_FE_MOCK_ITEMS) m.set(normalizeForOrder(it.name), it.showIcon);
  return m;
})();

const BNG_NAME_ORDER = (mockApi.tableListData.BNG ?? []).map((x: any) => x.name);
const BNG_SHOWICON_BY_NAME = (() => {
  const m = new Map<string, string>();
  for (const it of mockApi.tableListData.BNG ?? []) {
    m.set(normalizeForOrder((it as any).name), (it as any).showIcon);
  }
  return m;
})();

function getMockPercent() {
  // Same logic as FE mockApi.ts
  const isHighPercent = Math.random() < 0.3; // 30% games có % trên 85
  return isHighPercent
    ? Math.floor(Math.random() * 10) + 86 // 86-95
    : Math.floor(Math.random() * 85) + 1; // 1-85
}

function buildMockTableList(typeGameKey: string): TableItem[] {
  const baseData = (mockApi.tableListData[typeGameKey] ?? []) as any[];
  return baseData.map((it, idx) => ({
    _id: `${typeGameKey}-${it?.id ?? idx}`,
    name: it.name,
    typeGame: typeGameKey,
    time: "",
    percent: getMockPercent(),
    showIcon: it.showIcon
  }));
}

function normalizeForOrder(str: string) {
  // normalize similar to search: lowercase + remove Vietnamese accents/diacritics
  const s = (str ?? "").toString().toLowerCase();
  const from =
    "àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ";
  const to =
    "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const idx = from.indexOf(s[i]);
    out += idx >= 0 ? to[idx] : s[i];
  }
  return out.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function sortByFeMockOrder(items: TableItem[], order: string[]) {
  const rank = new Map<string, number>();
  order.forEach((name, i) => rank.set(normalizeForOrder(name), i));
  return [...items].sort((a, b) => {
    const ra = rank.get(normalizeForOrder(a.name));
    const rb = rank.get(normalizeForOrder(b.name));
    if (ra !== undefined && rb !== undefined) return ra - rb;
    if (ra !== undefined) return -1;
    if (rb !== undefined) return 1;
    // fallback: keep stable-ish alphabetical for unknown items
    return a.name.localeCompare(b.name, "vi");
  });
}

const Slot = () => {
  const [isShowLogout, setIsShowLogout] = useState(false);
  const [tableList, setTableList] = useState<TableItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth <= 480 : false
  );
  const { room } = useParams();
  const roomKeyRaw = (room ?? "").toString().toUpperCase();
  // Alias: DG uses PG list/icons/order (same as FE expectation)
  const roomKey = roomKeyRaw === "DG" ? "PG" : roomKeyRaw;
  const [isLoading, setIsLoading] = useState(false);

  const MOBILE_BREAKPOINT = 480;
  const MOBILE_INITIAL_VISIBLE = 12;
  const DESKTOP_INITIAL_VISIBLE = 40;
  const MOBILE_STEP_VISIBLE = 12;
  const DESKTOP_STEP_VISIBLE = 40;

  const [visibleCount, setVisibleCount] = useState(
    typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT
      ? MOBILE_INITIAL_VISIBLE
      : DESKTOP_INITIAL_VISIBLE
  );

  const scrollTickingRef = useRef(false);

  // Bỏ dấu tiếng Việt (kể cả đ, ư, ơ, ă, â, ê, ô) để tìm dễ
  const normalizeString = (str: string) => {
    const s = str.toLowerCase();
    const from =
      "àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ";
    const to =
      "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";
    let out = "";
    for (let i = 0; i < s.length; i++) {
      const idx = from.indexOf(s[i]);
      out += idx >= 0 ? to[idx] : s[i];
    }
    return out.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Filter tableList based on search term
  const filteredTableList = tableList.filter((item) => {
    if (!searchTerm.trim()) return true;
    const normalizedTitle = normalizeString(item.name);
    const normalizedSearch = normalizeString(searchTerm.trim());
    return normalizedTitle.includes(normalizedSearch);
  });

  const visibleTableList = useMemo(() => {
    return filteredTableList.slice(0, visibleCount);
  }, [filteredTableList, visibleCount]);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Reset số lượng hiển thị khi đổi mobile/desktop.
  useEffect(() => {
    setVisibleCount((prev) =>
      Math.max(prev, isMobile ? MOBILE_INITIAL_VISIBLE : DESKTOP_INITIAL_VISIBLE)
    );
  }, [isMobile]);

  // Reset visibleCount sau khi user nhập search (giống FE: debounce nhẹ).
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisibleCount(isMobile ? MOBILE_INITIAL_VISIBLE : DESKTOP_INITIAL_VISIBLE);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [searchTerm, isMobile]);

  // Infinite scroll: tăng dần số lượng item hiển thị khi scroll gần cuối trang
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTickingRef.current) return;
      scrollTickingRef.current = true;
      requestAnimationFrame(() => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold =
          document.body.offsetHeight - (isMobile ? 260 : 400);
        if (scrollPosition >= threshold) {
          setVisibleCount((prev) => {
            const maxVisible = filteredTableList.length || tableList.length;
            if (prev >= maxVisible) return prev;
            const step = isMobile ? MOBILE_STEP_VISIBLE : DESKTOP_STEP_VISIBLE;
            return Math.min(prev + step, maxVisible);
          });
        }
        scrollTickingRef.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredTableList.length, tableList.length, isMobile]);

  useEffect(() => {
    if (!isLoading) {
      Swal.fire({
        title: "Đang tải dữ liệu trò chơi",
        html: "<p class='swal-loading-subtext'>Load Data.</p><div class='swal-loading-dots'><span class='swal-dot swal-dot-cyan'></span><span class='swal-dot swal-dot-orange'></span></div>",
        customClass: {
          popup: "swal-loading-modal",
        },
        allowOutsideClick: false,
        showConfirmButton: false,
      });
    }

    const fetchTableList = async () => {
      try {
        // For PG/BNG: use FE mockApi directly to guarantee name+icon+order identical to FE.
        if (roomKey === "PG" || roomKey === "BNG") {
          const mockRes = await mockApi.getTableList(roomKey);
          const list = Array.isArray(mockRes.data) ? mockRes.data : [];

          const normalized: TableItem[] = list.map((it: any, idx: number) => ({
            _id: `${roomKey}-${it?.id ?? idx}`,
            name: it?.name ?? "",
            typeGame: roomKey,
            time: it?.time ?? "",
            percent: Number.isFinite(it?.percent) ? it.percent : 0,
            showIcon: it?.showIcon
          }));

          setTableList(normalized);
          setIsLoading(true);
          Swal.close();
          return;
        }

        const token = Cookies.get("access_token");
        const response = await axios.get(
          `${process.env.REACT_APP_URL_API_CASINO}/NH/tableList?typeGame=${roomKey}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (process.env.NODE_ENV !== "production") {
          const list = Array.isArray(response.data) ? response.data : [];
          // eslint-disable-next-line no-console
          console.groupCollapsed(
            `[NH/Slot] tableList ${String(roomKey)}: ${list.length} items`
          );
          // eslint-disable-next-line no-console
          console.log("firstItemKeys:", list[0] ? Object.keys(list[0]) : []);
          // eslint-disable-next-line no-console
          console.log(
            "first10Names:",
            list.slice(0, 10).map((x: any) => x?.name)
          );
          // eslint-disable-next-line no-console
          console.log(
            "first10ShowIcon:",
            list.slice(0, 10).map((x: any) => x?.showIcon)
          );
          // eslint-disable-next-line no-console
          console.log("roomParamRaw:", room);
          // eslint-disable-next-line no-console
          console.groupEnd();
        }
        const rawList: TableItem[] = Array.isArray(response.data) ? response.data : [];
        setTableList(rawList);
        setIsLoading(true);
        Swal.close();
      } catch (error) {
        console.error('Error fetching table list:', error);
      }
    };

    fetchTableList();
    window.scrollTo(0, 0);
  }, [room]);

  localStorage.setItem("NH_PAGE", String(roomKey));

  const hallTitle = `${roomKey || "PG"} GAME`;

  return (
    <div className="page-with-header">
      <Header setIsShowLogout={() => setIsShowLogout(true)} />
      {isLoading && (
        <div className="container-fluid lobby-bg position-relative mx-auto mb-5 slot-lobby-page">
          <div className="slot-game-page">
            <section className="slot-lobby-hero" aria-label="Danh sách game">
              <div className="slot-lobby-hero__inner">
                <button
                  type="button"
                  className="slot-lobby-back"
                  onClick={() => navigate("/NH")}
                  aria-label="Về chọn sảnh"
                >
                  <span className="slot-lobby-back__chevrons" aria-hidden>
                    &laquo;&laquo;
                  </span>
                  BACK
                </button>

                <h1 className="slot-lobby-title">{hallTitle}</h1>

                <form
                  className="slot-lobby-search"
                  onSubmit={(e) => e.preventDefault()}
                  role="search"
                >
                  <label className="slot-lobby-search__field">
                    <span className="slot-lobby-search__icon" aria-hidden>
                      &#128269;
                    </span>
                    <input
                      type="search"
                      className="slot-lobby-search__input"
                      placeholder="Tìm kiếm game..."
                      value={searchTerm}
                      onChange={handleSearch}
                      aria-label="Tìm kiếm game"
                    />
                  </label>
                  <button type="submit" className="slot-lobby-search__submit">
                    <span aria-hidden>&#128269;</span>
                    Tìm ngay
                  </button>
                </form>
              </div>
            </section>

            <div className="slot-game-grid">
              {visibleTableList.length === 0 ? (
                <p className="slot-game-empty">Không tìm thấy game phù hợp.</p>
              ) : (
                visibleTableList.map((item, index) => {
                  const iconNo = index + 1;
                  const feShowIcon =
                    roomKey === "PG"
                      ? PG_SHOWICON_BY_NAME.get(normalizeForOrder(item.name))
                      : roomKey === "BNG"
                        ? BNG_SHOWICON_BY_NAME.get(normalizeForOrder(item.name))
                        : undefined;
                  const imageUrl =
                    item.showIcon ||
                    feShowIcon ||
                    `/assets/NH/${roomKey}/${roomKey}_${iconNo.toString().padStart(2, "0")}.png`;

                  return (
                    <div key={item._id} className="slot-game-grid__item">
                      <ProgressBar
                        percentage={item.percent}
                        title={item.name}
                        imageUrl={imageUrl}
                        id={item._id}
                      />
                    </div>
                  );
                })
              )}
            </div>
            <div style={{ height: 120 }} aria-hidden />
          </div>
        </div>
      )}
      <ModalConfirmLogout
        isShowLogout={isShowLogout}
        setIsShowLogout={() => setIsShowLogout(false)}
      />
    </div>
  );
};

export default Slot;
