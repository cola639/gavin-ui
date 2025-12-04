import { message } from 'antd';
import axios from 'axios';

export async function exportExcelApi(exportUrl: string, fileName: string) {
  const hide = message.loading('Exporting, please wait...', 0);

  try {
    const res = await axios.get(exportUrl, {
      responseType: 'blob'
    });

    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    message.success('Export finished');
  } catch (e) {
    console.error(e);
    message.error('Export failed');
  } finally {
    hide();
  }
}
