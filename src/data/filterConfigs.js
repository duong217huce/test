export const filterConfigs = {
  education: {
    filters: [
      {
        key: 'grade',
        label: 'Lớp',
        options: ['Tất cả', 'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12']
      },
      {
        key: 'subject',
        label: 'Môn học',
        options: ['Tất cả', 'Toán', 'Văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học', 'Lịch sử', 'Địa lý', 'GDCD']
      }
    ]
  },
  professional: {
    filters: [
      {
        key: 'field',
        label: 'Lĩnh vực',
        options: ['Tất cả', 'Kinh tế', 'Công nghệ', 'Y học', 'Luật', 'Kiến trúc']
      },
      {
        key: 'level',
        label: 'Cấp độ',
        options: ['Tất cả', 'Cơ bản', 'Trung cấp', 'Nâng cao', 'Chuyên gia']
      }
    ]
  },
  literature: {
    filters: [
      {
        key: 'type',
        label: 'Thể loại',
        options: ['Tất cả', 'Thơ', 'Truyện ngắn', 'Tiểu thuyết', 'Truyện tranh']
      },
      {
        key: 'origin',
        label: 'Xuất xứ',
        options: ['Tất cả', 'Việt Nam', 'Châu Âu', 'Châu Á', 'Châu Mỹ']
      }
    ]
  },
  templates: {
    filters: [
      {
        key: 'category',
        label: 'Danh mục',
        options: ['Tất cả', 'Văn mẫu', 'Biểu mẫu hành chính', 'Biểu mẫu học tập']
      }
    ]
  },
  thesis: {
    filters: [
      {
        key: 'type',
        label: 'Loại',
        options: ['Tất cả', 'Luận văn', 'Báo cáo', 'Đề tài']
      },
      {
        key: 'degree',
        label: 'Cấp độ',
        options: ['Tất cả', 'Cử nhân', 'Thạc sĩ', 'Tiến sĩ']
      }
    ]
  },
  practice: {
    filters: [
      {
        key: 'examType',
        label: 'Loại kỳ thi',
        options: ['Tất cả', 'THPT Quốc gia', 'Đại học', 'Chứng chỉ', 'Thi công chức']
      },
      {
        key: 'subject',
        label: 'Môn học',
        options: ['Tất cả', 'Toán', 'Văn', 'Anh', 'Lý', 'Hóa', 'Sinh', 'TOEIC', 'IELTS']
      }
    ]
  }
};
