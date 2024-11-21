export const formatDate = (value) => {
  if (!value) return "--";

  const date = new Date(value);
  let format = "DD-MM-YYYY HH:mm:ss";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  format = format.replace("YYYY", year);
  format = format.replace("MM", month);
  format = format.replace("DD", day);
  format = format.replace("HH", hours);
  format = format.replace("mm", minutes);
  format = format.replace("ss", seconds);

  return format;
};
