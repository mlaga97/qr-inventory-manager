for i in `seq 1 $1`; do
  UUID=`uuidgen -r`;

  for j in `seq 1 $2`; do
    QR_CONTENT=$UUID
    TRUNCATED_UUID="`echo $UUID | sed 's|....-.*||' | tr [a-z] [A-Z]`-`echo $UUID | sed 's|....||; s|-....-....-............$||' | tr [a-z] [A-Z]`"
    CODENAMIZED_UUID=`codenamize $UUID -p2 -m4`
    echo $QR_CONTENT','$TRUNCATED_UUID','$CODENAMIZED_UUID
  done
done > test.csv

glabels-3-batch -i test.csv -o $3 18160_Template.glabels
