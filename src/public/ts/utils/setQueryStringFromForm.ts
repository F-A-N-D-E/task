export default function setQueryStringFromForm(form: HTMLFormElement) {
  let formData = new FormData(form);
  let queryStr = new URLSearchParams();

  for (let [key, val] of formData.entries()) {
    queryStr.set(key, val as string);
  }

  return queryStr.toString();
}
