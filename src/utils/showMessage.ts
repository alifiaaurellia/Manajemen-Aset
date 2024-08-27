import Swal, { SweetAlertIcon } from "sweetalert2"

export async function showMessage(icon: SweetAlertIcon, title: string, text: string) {
    return await Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: 'Close',
        customClass: {
            container: 'my-swall-index'
        }
      }).then(() => true)
}